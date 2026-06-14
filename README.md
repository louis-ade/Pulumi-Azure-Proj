# Pulumi → Azure Container Apps Web App

Deploys a custom containerized web application to **Azure Container Apps** using
Pulumi (TypeScript). The web page returns a **configurable greeting** set via
`pulumi config`. Core resources are wrapped in a reusable **`ContainerApp`
ComponentResource**.

The web app is based on the suggested
[starter gist](https://gist.github.com/smithrobs/a86bed2e7b6c4329241ff59a915623c1)
(an Express app on port 8080), modified to read its displayed value from the
`GREETING` environment variable.

## Layout

```
pulumi/
├── app/                     # The web application + Docker image
│   ├── server.js            # Express server (from the gist), reads GREETING env var
│   ├── package.json
│   └── Dockerfile           # Custom image built from node:18-slim
└── infra/                   # Pulumi program
    ├── index.ts             # Resource group, ACR + image, and the ContainerApp
    ├── containerApp.ts      # ComponentResource (managed env + container app)
    ├── Pulumi.yaml          # Project definition
    └── Pulumi.dev.yaml      # Stack config incl. the configurable greeting
```

## What gets created

- **Resource group:** the container for every other resource.
- **Image:** an Azure Container Registry (ACR) + a Docker image built from `app/Dockerfile` and pushed to ACR.
- **Compute (inside the `ContainerApp` component):** a Container Apps managed environment, and the Container App itself with external HTTPS ingress.

## The ComponentResource

`ContainerApp` (`infra/containerApp.ts`) encapsulates **two** related
resources — a Container Apps managed environment and the Container App — behind
a single constructor. This illustrates reusability: any number of services can
be stood up with one `new ContainerApp(name, args)` call.

## The configurable value

The greeting displayed on the page is driven by Pulumi config and injected into
the container as the `GREETING` environment variable.

```bash
# Set the value
pulumi config set greeting "Hello from the interview demo!"

# Re-deploy — the new value flows through to the Container App and the page
pulumi up
```

## Deploy

```bash
# Prereqs: Pulumi CLI, Azure CLI logged in (az login), Docker running.
cd infra
npm install
pulumi stack init dev
pulumi config set location eastus
pulumi config set greeting "Hello from Pulumi on Azure Container Apps!"
pulumi up

# The public URL is printed as a stack output:
pulumi stack output url
```

This stack is live in Azure. The deployed page is served at the `url` stack
output (East US), returning the configured greeting over managed HTTPS ingress.

## Tear down

```bash
pulumi destroy
```
