FROM registry.access.redhat.com/ubi10/ubi-init:latest

COPY repos/osbuild-rhel-10.repo repos/osbuild-composer-rhel-10.repo repos/cockpit-image-builder-rhel-10.repo /etc/yum.repos.d/

RUN dnf update -y && \
    dnf install -y \
        cockpit \
        cockpit-files \
        osbuild-composer \
        cockpit-image-builder \
    && dnf clean all

RUN mkdir -p /etc/systemd/system/cockpit.socket.d

COPY cockpit.socket.d/listen.conf /etc/systemd/system/cockpit.socket.d/listen.conf
COPY cockpit.conf /etc/cockpit/cockpit.conf

RUN if command -v semanage >/dev/null 2>&1; then \
        dnf install -y policycoreutils-python-utils && \
        semanage port -a -t websm_port_t -p tcp 9091 || true; \
    fi

RUN systemctl enable cockpit.socket osbuild-composer.socket

RUN echo 'root:cockpit' | chpasswd

RUN if [ -f /etc/cockpit/disallowed-users ]; then \
        sed -i '/^root$/d' /etc/cockpit/disallowed-users; \
    fi

EXPOSE 9091

ENV container=podman

STOPSIGNAL SIGRTMIN+3

CMD ["/usr/sbin/init"]
