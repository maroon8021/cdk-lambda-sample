SHELL=/bin/bash

.PHONY: generate-csr
generate-csr:
	openssl genrsa -out ${CLIENT}.key 2048
	openssl req -new -nodes -newkey rsa:2048 -days 365 -keyout ${CLIENT}.key -subj "/CN=${CN}" -out ${CLIENT}.csr

.PHONY: issue-client-cert
issue-client-cert:
	$(eval CERTIFICATE_ARN := $(shell aws acm-pca issue-certificate --certificate-authority-arn ${CERTIFICATE_AUTHORITY_ARN} --csr fileb://${CLIENT}.csr --signing-algorithm "SHA256WITHRSA" --validity Value=365,Type="DAYS" | jq -r .CertificateArn))

.PHONY: get-client-cert
get-client-cert:
	aws acm-pca get-certificate --certificate-authority-arn ${CERTIFICATE_AUTHORITY_ARN} --certificate-arn ${CERTIFICATE_ARN} | jq -r .Certificate > ${CLIENT}.crt
	aws acm-pca get-certificate --certificate-authority-arn ${CERTIFICATE_AUTHORITY_ARN} --certificate-arn ${CERTIFICATE_ARN} | jq -r .CertificateChain > ${CLIENT}_chain.crt

.PHONY: generate-cliet-pfx
generate-client-pfx:
	openssl pkcs12 -export -out ${CLIENT}.pfx -inkey ${CLIENT}.key -in ${CLIENT}.crt -certfile ${CLIENT}_chain.crt -password pass:${CERTIFICATE_PASSWORD}

.PHONY: get-client-pfx
get-client-pfx: generate-csr issue-client-cert get-client-cert generate-client-pfx