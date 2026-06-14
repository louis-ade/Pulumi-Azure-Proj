# Pulumi → Azure Container Apps: A Configurable Web App

This project takes a small website and puts it live on the internet using
Microsoft's cloud (**Azure**). The website does one simple thing: it shows a
**greeting message** that you can change without touching any code.

Everything about the setup — the server, the network, the security — is described
in code using a tool called **Pulumi**. That means anyone can recreate the exact
same setup with a single command, instead of clicking through dozens of screens
in a cloud dashboard.

> **New to all this?** Don't worry. This README explains every term and every
> step in plain language. You can follow it even if you've never deployed
> anything to the cloud before. There's a [glossary](#glossary-plain-english) at
> the bottom.

---

## Table of contents

1. [What this project does](#what-this-project-does)
2. [The big picture (how it all fits together)](#the-big-picture)
3. [The technologies, explained simply](#the-technologies-explained-simply)
4. [What you need before you start](#what-you-need-before-you-start)
5. [Step-by-step: putting the app online](#step-by-step-putting-the-app-online)
6. [Changing the greeting message](#changing-the-greeting-message)
7. [Taking everything back down](#taking-everything-back-down-so-you-stop-paying)
8. [What the files in this project are](#what-the-files-in-this-project-are)
9. [How the code is organized (the "reusable building block")](#how-the-code-is-organized)
10. [Troubleshooting](#troubleshooting)
11. [Glossary (plain English)](#glossary-plain-english)

---

## What this project does

Imagine a web page that simply says, in big letters:

> **Hello from Pulumi on Azure Container Apps!**

Now imagine you want to change that message to "Welcome to my demo!" — but you
don't want to edit any code, rebuild anything, or redeploy from scratch. You just
want to flip a setting and have the live website update.

That's exactly what this project delivers:

- A real, public website running in Microsoft's cloud.
- The message on it is a **setting** (called `greeting`) that you control.
- The whole thing is created, updated, and deleted with simple commands.

---

## The big picture

Here's the journey your code takes to become a live website, in order:

```
 Your computer                         Microsoft Azure (the cloud)
 ┌───────────────────┐                 ┌──────────────────────────────────────┐
 │ 1. The web app    │                 │                                      │
 │    (a tiny server │                 │   ┌──────────────┐                   │
 │     that shows a  │   2. Packaged   │   │ Container    │  4. Stored in     │
 │     greeting)     │ ─────────────▶  │   │ Registry     │     your private  │
 │                   │   into a        │   │ (ACR)        │     image library │
 │ 3. Pulumi reads   │   "container"   │   └──────┬───────┘                   │
 │    your settings  │                 │          │ 5. Pulled & run           │
 │    and runs it    │                 │          ▼                           │
 └───────────────────┘                 │   ┌──────────────┐                   │
                                        │   │ Container App │ 6. Live website  │
                                        │   │ (the running  │    with HTTPS    │
                                        │   │  website)     │    address       │
                                        │   └──────────────┘                   │
                                        └──────────────────────────────────────┘
```

1. **The web app** is a tiny program that, when visited, replies with an HTML
   page showing the greeting.
2. It gets **packaged into a container** — think of a container as a sealed box
   that holds the app *and* everything it needs to run, so it behaves the same
   anywhere.
3. **Pulumi** is the conductor. You run one command and it does the rest.
4. The container is uploaded to a **private image library** in Azure (the
   Container Registry).
5. Azure **pulls that container and runs it** on a managed service.
6. You get back a **public web address** (with automatic HTTPS security) that
   anyone can visit.

---

## The technologies, explained simply

| Term | What it actually is | An everyday analogy |
| --- | --- | --- |
| **Azure** | Microsoft's cloud — rented computers and services you use over the internet. | Renting an apartment instead of building a house. |
| **Container** | A sealed package holding your app + everything it needs. | A shipping container: pack once, it works on any ship or truck. |
| **Docker** | The tool that builds these containers. | The machine that seals the shipping container. |
| **Azure Container Registry (ACR)** | Your own private storage for containers in Azure. | A private warehouse for your sealed boxes. |
| **Azure Container Apps** | The service that runs your container and exposes it to the web. | The truck that drives your box around and lets people see inside. |
| **Pulumi** | A tool that lets you describe your cloud setup *in code* and create it with one command. | An architect's blueprint that builds the house automatically. |
| **Greeting (config value)** | A setting you can change without editing code. | The message on a sign you can swap out without rebuilding the sign. |

### Why "infrastructure as code"?

Normally, setting up a cloud app means lots of clicking in a web dashboard — easy
to get wrong, hard to repeat. **Pulumi** lets you write the setup as code instead.
The benefits:

- **Repeatable:** the same command always produces the same result.
- **Reviewable:** the setup lives in files you can read and share.
- **Reversible:** one command tears it all down cleanly.

---

## What you need before you start

You'll install three free tools and have one account. Each line explains *why*
you need it.

1. **An Azure account** — this is where your website will live.
   Sign up at <https://azure.com>. (New accounts usually get free credit.)
2. **The Pulumi CLI** — the command-line tool that does the deploying.
   Install: <https://www.pulumi.com/docs/install/>
3. **The Azure CLI** (`az`) — lets your computer log in to Azure.
   Install: <https://learn.microsoft.com/cli/azure/install-azure-cli>
   Then run `az login` once to connect.
4. **Docker** — needed to build the container.
   Install: <https://docs.docker.com/get-docker/> and make sure it's running.

> **How do I know they're installed?** Open a terminal and type `pulumi version`,
> `az version`, and `docker version`. If each prints a version number, you're good.

---

## Step-by-step: putting the app online

Open a terminal (the black "command line" window) and run these commands one at a
time. Lines starting with `#` are explanations — you don't type those.

```bash
# Connect your computer to your Azure account (opens a browser window once).
az login

# Go into the folder that contains the Pulumi program.
cd infra

# Download the building blocks the program depends on.
npm install

# Create a named "stack" — a stack is one independent copy of your app.
# We'll call it "dev" (for development). You can have others, like "prod".
pulumi stack init dev

# Choose which Azure region (data center location) to deploy to.
pulumi config set location eastus

# Set the message your website will display. Change the text to anything!
pulumi config set greeting "Hello from Pulumi on Azure Container Apps!"

# Build everything and put it online. This takes a few minutes the first time.
# Pulumi shows you a preview of what it will create and asks you to confirm.
pulumi up

# When it finishes, ask Pulumi for your website's public address:
pulumi stack output url
```

Copy the address from that last command into your browser — your website is
live, and it shows your greeting. 🎉

> **Shortcut:** there's also a `deploy.sh` script that runs the install and
> `pulumi up` steps for you. From the project root: `./deploy.sh`

---

## Changing the greeting message

This is the whole point of the project — changing the message **without editing
any code**:

```bash
cd infra

# Set a new message.
pulumi config set greeting "Welcome to my demo!"

# Apply the change. Pulumi updates only what changed — fast.
pulumi up
```

Refresh your website in the browser and the new message appears. Behind the
scenes, Pulumi handed the new text to the running container as a setting (an
"environment variable" called `GREETING`), and the app reads it live.

---

## Taking everything back down (so you stop paying)

Cloud resources can cost money while they're running. When you're done, remove
**everything** this project created with one command:

```bash
cd infra
pulumi destroy
```

Pulumi shows you exactly what it will delete and asks you to confirm. After it
finishes, nothing is left running in Azure and there's nothing more to pay for.

---

## What the files in this project are

```
.
├── app/                     # The website itself
│   ├── server.js            # The tiny program that shows the greeting
│   ├── package.json         # Lists the app's one dependency (Express)
│   ├── Dockerfile           # The recipe for packaging the app into a container
│   └── .dockerignore        # Files to leave out of the container
│
├── infra/                   # The "blueprint" — how the cloud is set up
│   ├── index.ts             # Main file: creates the registry, image, and app
│   ├── containerApp.ts      # A reusable building block (explained below)
│   ├── Pulumi.yaml          # Project name and settings
│   ├── Pulumi.dev.yaml      # Your "dev" stack's settings (region + greeting)
│   ├── package.json         # Lists the Pulumi building blocks used
│   └── tsconfig.json        # TypeScript settings
│
├── deploy.sh                # A shortcut script: install + deploy in one go
└── README.md                # This file
```

### A closer look at the two main pieces

- **`app/server.js`** — a few lines of JavaScript using **Express** (a popular,
  beginner-friendly web framework). When someone visits the site, it sends back
  an HTML page containing whatever `GREETING` is set to. If no greeting is set,
  it falls back to "Hello World".

- **`app/Dockerfile`** — the recipe that turns the app into a container. It
  starts from a small, official base image (`node:18-slim`), copies the app in,
  installs its dependency, and says "run `server.js` when started." We use the
  *slim* base on purpose: it's much smaller, so it builds and downloads faster.

---

## How the code is organized

One requirement of this project was to create a **reusable building block** — in
Pulumi terms, a **Component Resource**. Here's what that means in plain English.

Running a website on Azure Container Apps actually needs **two** cloud resources:

1. A **managed environment** — the "neighborhood" the app lives in (it handles
   networking and shared settings).
2. The **Container App** itself — the running website.

Instead of wiring those two up by hand every time, this project bundles them into
a single reusable component called `ContainerApp` (in `infra/containerApp.ts`).
Now the main file (`infra/index.ts`) can create a complete, internet-facing web
service with **one line**:

```ts
const web = new ContainerApp("pulumi-aca-webapp", {
  /* image to run, the greeting, registry login, etc. */
});
```

Think of it like a recipe card: the messy details are written down once, and from
then on you just say "make one of these." If you wanted a *second* website, you'd
add one more line — no copy-pasting.

The main file (`infra/index.ts`) is responsible for the surrounding pieces:

1. Creating a **resource group** (a folder that holds everything, so it's easy to
   find and delete together).
2. Creating the **Container Registry** (your private container storage).
3. **Building the container** from `app/Dockerfile` and uploading it.
4. Handing all of that to the `ContainerApp` component to run.
5. Printing the final **public URL** so you know where to visit.

---

## Troubleshooting

| Symptom | Likely cause & fix |
| --- | --- |
| `pulumi: command not found` | Pulumi isn't installed or not on your PATH. Reinstall from the link above and reopen your terminal. |
| `az login` errors / "not logged in" | Run `az login` and complete the browser sign-in. Make sure your Azure account is active. |
| The build step hangs or fails | Make sure **Docker is running** (open Docker Desktop). The build needs it. |
| "Quota" or "region" errors | Some regions limit how many environments you can have. Try a different `location` (e.g. `pulumi config set location westus`). |
| The page loads but shows the old message | Run `pulumi up` again after `pulumi config set greeting "..."` — the change only applies after you re-deploy. |

---

## Glossary (plain English)

- **Cloud / Azure** — someone else's computers (Microsoft's) that you rent over
  the internet instead of buying and maintaining your own.
- **Deploy** — to put your app onto those computers so the world can use it.
- **Container** — a sealed package with your app and everything it needs, so it
  runs identically everywhere.
- **Image** — the saved blueprint of a container (you "run an image" to get a
  running container).
- **Registry (ACR)** — a private place to store your container images in Azure.
- **Container App** — Azure's service that runs your container and gives it a
  public web address with automatic HTTPS.
- **Managed environment** — the shared "neighborhood" (networking, etc.) your
  Container App runs inside.
- **Resource group** — a folder in Azure that groups related resources so you can
  manage and delete them together.
- **Pulumi** — the tool that turns your written blueprint into real cloud
  resources with one command.
- **Stack** — one independent deployment of your project (e.g. `dev`, `prod`),
  each with its own settings.
- **Config value** — a setting you can change (like `greeting`) without editing
  code.
- **Environment variable** — a named setting handed to a running program; here,
  the greeting is passed to the app as `GREETING`.
- **HTTPS** — the secure (padlock) version of web addresses; Azure sets this up
  for you automatically.
