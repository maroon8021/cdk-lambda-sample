FROM lambci/lambda:build-nodejs12.x



# install some packages
RUN echo "start install packages"
RUN yum install -y jq openssl

# install aws-cli
RUN echo "install aws-cli"
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64-2.0.57.zip" -o "awscliv2.zip"
RUN unzip awscliv2.zip
RUN ./aws/install