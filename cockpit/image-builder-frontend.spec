# XXX: package name?
Name:           image-builder-frontend
Version:        0
Release:        1
Summary:        image builder frontend for use with Cockpit

License:        Apache
URL:            http://osbuild.org/
Source0:        %{name}-%{version}.tar.gz

BuildArch:      noarch
BuildRequires:  gettext
BuildRequires:  libappstream-glib
BuildRequires:  make
BuildRequires:  nodejs

Requires:       cockpit
Requires: osbuild-composer >= 103

%description
# XXX: this was copied straight from the cockpit project
The image-builder-frontend generates custom images suitable for deploying systems or uploading to
the cloud. It integrates into Cockpit as a frontend for osbuild.

%prep
%setup -q -n %{name}

%build
# Nothing to build

%install
%make_install PREFIX=/usr
appstream-util validate-relax --nonet %{buildroot}/%{_datadir}/metainfo/*

%files
%doc cockpit/README.md
%license LICENSE
%{_datadir}/cockpit/image-builder-frontend
%{_datadir}/metainfo/*
