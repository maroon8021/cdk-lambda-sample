import { execSync } from "child_process";
import { readdir, copyFileSync, readFileSync, writeFileSync } from "fs";
import { ACMPCAClient } from "@aws-sdk/client-acm-pca-node/ACMPCAClient";
import { ACMPCA } from "aws-sdk";
import { resolvers } from "../resolvers";

const acmpca = new ACMPCA();

export const app = async () => {
  console.log("called app");
  return "app is called";
};

export const exec = async () => {
  console.log("called exec");
  const uniqueDomainName = "test-domain";
  const dir = "/tmp/";
  const password = "password";
  const CERTIFICATE_AUTHORITY_ARN = process.env.CERTIFICATE_AUTHORITY_ARN || "";

  process.env.PATH += ":/var/task";

  //execSync("unzip awscliv2.zip -d /tmp");
  //execSync("unzip awscliv2.zip -d /tmp && /tmp/aws/install");
  //const result = execSync("aws --version").toString()

  // try {
  //   //copyFileSync("./awscliv2.zip", "/tmp/awscliv2.zip");

  //   // prettier-ignore
  //   const result3 = execSync('sudo find / -name "aws"').toString();
  //   const result2 = execSync("ls /usr/local/bin").toString();
  //   //execSync("unzip /tmp/awscliv2.zip && /tmp/aws/install");
  //   const result = execSync("ls /tmp").toString();
  //   return {
  //     result,
  //     result2,
  //     result3,
  //   };
  // } catch (error) {
  //   console.error(error);
  //   return error;
  // }

  // execSync(
  //   `make get-client-pfx CLIENT=${dir}${uniqueDomainName} CN=${uniqueDomainName} CERTIFICATE_AUTHORITY_ARN=${CERTIFICATE_AUTHORITY_ARN} CERTIFICATE_PASSWORD=${password}`
  // );

  execSync(
    `make generate-csr CLIENT=${dir}${uniqueDomainName} CN=${uniqueDomainName}`
  );

  const Csr = readFileSync(`${dir}${uniqueDomainName}.csr`);

  // issue Certificate
  const issueCertificateParams = {
    CertificateAuthorityArn: CERTIFICATE_AUTHORITY_ARN,
    Csr,
    SigningAlgorithm: "SHA256WITHRSA",
    Validity: {
      Type: "DAYS",
      Value: 365,
    },
  };

  console.log("before issueCertificate");
  const { CertificateArn } = await issueCertificate(issueCertificateParams);

  // get certificate
  const getCertificateParams = {
    CertificateArn,
    CertificateAuthorityArn: CERTIFICATE_AUTHORITY_ARN,
  };

  console.log("before getCertificate");
  await getCertificate(getCertificateParams, dir, uniqueDomainName);

  console.log("before generate-cliet-pfx");

  // generate
  execSync(
    `make generate-cliet-pfx CLIENT=${dir}${uniqueDomainName} CERTIFICATE_PASSWORD=${password}`
  );

  return execSync("ls /tmp").toString();
};

const issueCertificate = async (
  issueCertificateParams: any
): Promise<{ CertificateArn: string }> => {
  return new Promise((resolve, _) => {
    acmpca.issueCertificate(issueCertificateParams, (err, data) => {
      console.log("issueCertificate callback");
      if (err) {
        console.log(err);
      } else if (data && data.CertificateArn) {
        resolve({ CertificateArn: data.CertificateArn });
      }
    });
  });
};

const getCertificate = async (
  getCertificateParams: any,
  dir: string,
  uniqueDomainName: string
) => {
  return new Promise((resolver, _) => {
    acmpca.getCertificate(getCertificateParams, (err, data) => {
      console.log("getCertificate callback");
      console.log(data);
      if (err) {
        console.log(err);
      } else if (data.Certificate && data.CertificateChain) {
        writeFileSync(`${dir}${uniqueDomainName}.crt`, data.Certificate);
        writeFileSync(
          `${dir}${uniqueDomainName}_chain.crt`,
          data.CertificateChain
        );
        resolver();
      }
    });
  });
};
