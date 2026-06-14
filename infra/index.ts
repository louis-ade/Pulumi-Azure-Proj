import * as containerregistry from "@pulumi/azure-native/containerregistry";
import * as resources from "@pulumi/azure-native/resources";
import * as docker from "@pulumi/docker";
import * as pulumi from "@pulumi/pulumi";

import { ContainerApp } from "./containerApp";

// The configurable value shown on the web page.
//   pulumi config set greeting "Your message here"
const config = new pulumi.Config();
const greeting = config.get("greeting") ?? "Hello from Pulumi on Azure!";
const location = config.get("location") ?? "eastus";

const name = "pulumi-aca-webapp";

// Resource group that holds every resource.
const resourceGroup = new resources.ResourceGroup(`${name}-rg`, { location });

// Container registry to hold our custom image.
// ACR names must be alphanumeric only (no hyphens), so use a hyphen-free base;
// Pulumi appends a random alphanumeric suffix for global uniqueness.
const registry = new containerregistry.Registry("pulumiacawebappreg", {
  resourceGroupName: resourceGroup.name,
  sku: { name: "Basic" },
  adminUserEnabled: true,
});

const creds = pulumi
  .all([resourceGroup.name, registry.name])
  .apply(([rg, reg]) =>
    containerregistry.listRegistryCredentials({
      resourceGroupName: rg,
      registryName: reg,
    }),
  );
const registryUsername = creds.apply((c) => c.username ?? "");
const registryPassword = creds.apply((c) => c.passwords?.[0]?.value ?? "");

// Build the Dockerfile in ../app and push it to the registry.
const image = new docker.Image(`${name}-image`, {
  imageName: pulumi.interpolate`${registry.loginServer}/${name}:latest`,
  build: { context: "../app", platform: "linux/amd64" },
  registry: {
    server: registry.loginServer,
    username: registryUsername,
    password: pulumi.secret(registryPassword),
  },
});

// The reusable component: managed environment + container app.
const web = new ContainerApp(name, {
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  image: image.imageName,
  greeting,
  registryServer: registry.loginServer,
  registryUsername,
  registryPassword,
});

// Stack outputs.
export const url = web.url;
export const configuredGreeting = greeting;
