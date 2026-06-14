import * as app from "@pulumi/azure-native/app";
import * as pulumi from "@pulumi/pulumi";

/** Inputs for the {@link ContainerApp} component. */
export interface ContainerAppArgs {
  resourceGroupName: pulumi.Input<string>;
  location: pulumi.Input<string>;
  /** Container image to run (e.g. myreg.azurecr.io/app:latest). */
  image: pulumi.Input<string>;
  /** The configurable value injected as the GREETING env var. */
  greeting: pulumi.Input<string>;
  /** Private registry login details so the app can pull the image. */
  registryServer: pulumi.Input<string>;
  registryUsername: pulumi.Input<string>;
  registryPassword: pulumi.Input<string>;
}

/**
 * ContainerApp bundles the two resources needed to run a container on Azure
 * Container Apps into one reusable component:
 *
 *   1. a Container Apps managed environment
 *   2. the Container App itself (HTTPS ingress + the configurable GREETING)
 *
 * A caller gets a publicly reachable service from a single `new ContainerApp(...)`.
 */
export class ContainerApp extends pulumi.ComponentResource {
  public readonly url: pulumi.Output<string>;
  public readonly appName: pulumi.Output<string>;

  constructor(
    name: string,
    args: ContainerAppArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("webapp:azure:ContainerApp", name, {}, opts);

    // 1) The managed environment the app runs in.
    const environment = new app.ManagedEnvironment(
      `${name}-env`,
      {
        resourceGroupName: args.resourceGroupName,
        location: args.location,
        zoneRedundant: false,
      },
      { parent: this },
    );

    // 2) The Container App: pulls the image, injects GREETING, exposes HTTPS.
    const containerApp = new app.ContainerApp(
      `${name}-app`,
      {
        resourceGroupName: args.resourceGroupName,
        location: args.location,
        // azure-native exposes the managed environment under both property
        // names; set both to the same id so the resource stays stable across
        // provider/state versions and never plans a spurious replace.
        environmentId: environment.id,
        managedEnvironmentId: environment.id,
        configuration: {
          ingress: { external: true, targetPort: 8080 },
          secrets: [{ name: "registry-password", value: args.registryPassword }],
          registries: [
            {
              server: args.registryServer,
              username: args.registryUsername,
              passwordSecretRef: "registry-password",
            },
          ],
        },
        template: {
          containers: [
            {
              name,
              image: args.image,
              env: [{ name: "GREETING", value: args.greeting }],
            },
          ],
          scale: { minReplicas: 1, maxReplicas: 1 },
        },
      },
      { parent: this },
    );

    this.url = containerApp.configuration.apply(
      (c) => `https://${c?.ingress?.fqdn ?? ""}`,
    );
    this.appName = containerApp.name;

    this.registerOutputs({ url: this.url, appName: this.appName });
  }
}
