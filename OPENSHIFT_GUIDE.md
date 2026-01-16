# CloudVault - OpenShift Deployment Guide

This guide provides instructions for deploying and presenting CloudVault on an OpenShift cluster.

## Prerequisites
- Red Hat OpenShift CLI (`oc`) installed and authenticated.
- An active OpenShift project.

## 1. Environment Setup
Create the required secrets and persistence layer:
```bash
oc apply -f openshift/secret.yaml
oc apply -f openshift/mysql-pvc.yaml
```

## 2. Database Deployment
Deploy the MySQL database and wait for it to be ready:
```bash
oc apply -f openshift/mysql-dc.yaml
```

## 3. Application Deployment
Deploy the backend and frontend services:
```bash
oc apply -f openshift/backend-dc.yaml
oc apply -f openshift/frontend-dc.yaml
```

## 4. Verification
Check the status of your pods and routes:
```bash
oc get pods
oc get routes
```

## Presentation Talking Points
- **Containerization**: "We used Dockerfiles and multi-stage builds to optimize the images for OpenShift."
- **Persistence**: "Notice the `PersistentVolumeClaim` that ensures user data survives pod restarts."
- **Security**: "Secrets are used to manage sensitive credentials like JWT keys and database passwords."
- **Scalability**: "The application can be scaled horizontally with a single command or automated via HPA."
