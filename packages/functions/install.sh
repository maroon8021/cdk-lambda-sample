# /bin/bash
cd /asset-output

# install yum

# Install dependencies need to install yum

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/gpgme-1.3.2-5.el7.i686.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/pygpgme-0.3-9.el7.x86_64.rpm
#rpm -K --nosignature pygpgme-0.3-9.el7.x86_64.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/pyliblzma-0.5.3-11.el7.x86_64.rpm
#rpm -K --nosignature pyliblzma-0.5.3-11.el7.x86_64.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/python-iniparse-0.4-9.el7.noarch.rpm
#rpm -K --nosignature python-iniparse-0.4-9.el7.noarch.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/python-pycurl-7.19.0-19.el7.x86_64.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/python-urlgrabber-3.10-10.el7.noarch.rpm
#rpm -K --nosignature python-urlgrabber-3.10-10.el7.noarch.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/pyxattr-0.5.1-5.el7.x86_64.rpm
#rpm -K --nosignature pyxattr-0.5.1-5.el7.x86_64.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/rpm-4.11.3-43.el7.x86_64.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/rpm-python-4.11.3-43.el7.x86_64.rpm
#rpm -K --nosignature rpm-python-4.11.3-43.el7.x86_64.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/yum-metadata-parser-1.1.4-10.el7.x86_64.rpm
#rpm -K --nosignature yum-metadata-parser-1.1.4-10.el7.x86_64.rpm

curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/yum-plugin-fastestmirror-1.1.31-53.el7.noarch.rpm
#rpm -K --nosignature yum-plugin-fastestmirror-1.1.31-53.el7.noarch.rpm


sudo rpm -ivh gpgme-1.3.2-5.el7.i686.rpm
sudo rpm -ivh pygpgme-0.3-9.el7.x86_64.rpm
sudo rpm -ivh pyliblzma-0.5.3-11.el7.x86_64.rpm
sudo rpm -ivh python-iniparse-0.4-9.el7.noarch.rpm
sudo rpm -ivh python-pycurl-7.19.0-19.el7.x86_64.rpm
sudo rpm -ivh python-urlgrabber-3.10-10.el7.noarch.rpm
sudo rpm -ivh pyxattr-0.5.1-5.el7.x86_64.rpm
sudo rpm -ivh rpm-4.11.3-43.el7.x86_64.rpm
sudo rpm -ivh rpm-python-4.11.3-43.el7.x86_64.rpm
sudo rpm -ivh yum-metadata-parser-1.1.4-10.el7.x86_64.rpm
sudo rpm -ivh yum-plugin-fastestmirror-1.1.31-53.el7.noarch.rpm


# Install yum itself
curl -OL http://mirror.centos.org/centos/7/os/x86_64/Packages/yum-3.4.3-167.el7.centos.noarch.rpm
#rpm -K --nosignature　yum-3.4.3-167.el7.centos.noarch.rpm
sudo rpm -ivh yum-3.4.3-167.el7.centos.noarch.rpm


yum -v
yum update



