---
layout: post
title:  "Releasing to Maven Central (via OSSRH)"
date:   2021-03-25 11:00:00 +0100
categories: [blog]
tags: [guide, roger]
permalink: /releasing-to-maven-central-via-ossrh/
---


This is a bit of a long post, describing some of the history, the rationale for this change, 
and offers some guidance/explanation for what we have changed/migrated to. 

Use headings to jump around to the parts you are interested in :)


## Before...

The JavaParser project previously used JFrog's great Bintray service for OSS projects.

Specifically, Bintray offered a service where we could upload our packaged JAR, 
then the remainder of the release process could be managed via a web UI.

Within the JFrog Bintray web UI, we could 
- browse through the uploaded (staged) files,
- optionally drop (abandon) that staged release and try again, 
- optionally push (close/release) it to the Sonatype OSS Repository Hosting (OSSRH),
- ... among other less-used features (e.g. look back to see who performed what action)


This functionality and support is something provided free of charge for a long time, 
something that we are extremely grateful - thank you! 


## The change

In February 2021, JFrog [suddenly announced](https://jfrog.com/blog/into-the-sunset-bintray-jcenter-gocenter-and-chartcenter/) that their free Bintray service would be unavailable from May 2021.

Summary (emphasis mine):

> To streamline the productivity of the JFrog Platform **we will be sunsetting Bintray 
> (including JCenter)**, GoCenter, and ChartCenter services on May 1st, 2021. **Users of 
> these services will need to migrate to the respective canonical repository,**

Also:

> **On May 1, 2021, the sunset will impact all existing Bintray users. Bintray users will
> be blocked and will no longer be able to use the Bintray service**. This includes existing 
> software distribution, account administrative access, UI access, and the REST API.
>
> After this date JCenter repository will still resolve artifacts, but end users 
> should migrate to the canonical repo (e.g. Java packages should be retrieved from 
> Maven Central). On Feb 1st, 2022 JCenter will only resolve artifacts for Artifactory clients.



## What now?

We have talked about removing Bintray from the process for a while with warm support, but with
only limited appetite for doing so given that "it works" and there are (were) other priorities. 

This announcement changes that decision!


### Options

To continue pushing releases onto Maven Central (therefore available for users), 
we have a few alternative options:

- Migrate to "other" products within the JFrog platform
- Migrate to some "other" 3rd-party staging platforms
- Migrate to the Sonatype Open Source Software Repository Hosting Service (Sonatype OSSRH)
- Migrate to... something else...

Each of these have their own pros/cons.

Some factors/functionality to be considered include:

- Updating versions (to the "release" version, and then to the next "snapshot" version)
- Updating version numbers within the readme
- Signing artifacts
- Uploading artifacts


## The "new" Release Process

You can take a look at the diff within this PR where we got started with this:
https://github.com/javaparser/javaparser/pull/3180/files

_(note that it has changed somewhat since)_

The issue:
https://github.com/javaparser/javaparser/issues/3086


### Step 1: Update the project's POM

This step is straightforward for an existing project - remove references to bintray, 
and replace them with references to the Sonatype OSS Repository Hosting (OSSRH) service. 

Specifically, the `<distributionManagement>` should be changed. 
This is where the `<repository>` and `<snapshotRepository>` configurations are located.

In this section of `pom.xml`,  note the value `<id>ossrh</id>`. 
The value here is arbitrary, but it does need to be consistent with your `~/.m2/settings.xml` 
file (where your OSSRH credentials will be supplied).

```xml
    <distributionManagement>
      <snapshotRepository>
        <id>ossrh</id>
        <url>https://oss.sonatype.org/content/repositories/snapshots</url>
      </snapshotRepository>
      <repository>
        <id>ossrh</id>
        <url>https://oss.sonatype.org/service/local/staging/deploy/maven2/</url>
      </repository>
    </distributionManagement>
```

When setting up a new project, note that the Maven Release Plugin _also_ 
needs a correctly configured **Source Code Management (SCM) configuration** defined.

In addition to this, you MUST have SSH access to your git repository.

Here is the 
[current version of the JavaParser parent `pom.xml`](https://github.com/javaparser/javaparser/blob/master/pom.xml)
at the time of writing:

```xml
    <scm>
        <connection>scm:git:git://github.com/javaparser/javaparser.git</connection>
        <developerConnection>scm:git:git@github.com:javaparser/javaparser.git</developerConnection>
        <url>https://github.com/javaparser/javaparser.git</url>
        <tag>HEAD</tag>
    </scm>
```


### Step 2: Setup your environment

#### Step 2.1: Setup GPG for local use
There are lots that I do not know about GPG and there will be many other guides about this,
but to get going it is very straightforward in a "run these steps and it works" way.

One guide for this is available via the [Sonatype website](https://central.sonatype.org/pages/working-with-pgp-signatures.html#distributing-your-public-key).

Here is an abridged version:

1. Install GPG (or verify that it is already installed)
2. Generate a GPG keypair (public key and private key)
3. Upload your public key to a keyserver





#### Step 2.2: Supply credentials to Maven
Credentials need to be provided for the Sonatype Open Source Software Repository Hosting (OSSRH)
server (the place where the release will be uploaded), and for GPG (used to "sign" the 
release artifacts e.g. JARs).

It is inappropriate to provide these credentials within a shared `pom.xml` that is 
openly accessible and readable to anybody with access to the repository (i.e. everybody).

Instead, we can set up local user-specific settings via `~/.m2/settings.xml`.

A [template for this file](https://github.com/javaparser/javaparser/blob/master/dev-files/settings.xml)
is included within the `dev-files` folder within the JavaParser project.
Ideally these credentials will be defined within environment variables, but 
they may also be included directly within the `settings.xml` file directly too.

Note the value `<id>ossrh</id>` -- the value here is arbitary, but it does need to be 
consistent with the server id within the `pom.xml`'s `<distributionManagement>` section.

At the time of writing, this is the content of this template:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">

    <!-- THIS IS A TEMPLATE/SAMPLE FOR THE ~/.m2/settings.xml CONFIGURATION FILE, USED e.g. WHEN PERFORMING A RELEASE -->
    <!-- Values should be placed into environment variables (preferred), though you _can_ insert the values directly below. -->

    <servers>
        <server>
            <!-- Credentials for Sonatype OSSRH (OSS Repository Hosting) -->
            <!-- These are the same credentials you use for https://oss.sonatype.org/ and their JIRA ticketing system. -->
            <!-- https://central.sonatype.org/pages/apache-maven.html -->
            <id>ossrh</id>
            <username>${env.MAVEN_OSSRH_USERNAME}</username>
            <password>${env.MAVEN_OSSRH_PASSWORD}</password>
        </server>
    </servers>

    <profiles>
        <profile>
            <id>gpg-credentials</id>
            <activation>
                <activeByDefault>true</activeByDefault>
            </activation>
            <properties>
                <!-- You may need to adjust to the reflect the executable within your environment e.g. `gpg2` -->
                <gpg.executable>gpg</gpg.executable>
                <gpg.keyname>${env.MAVEN_GPG_KEYNAME}</gpg.keyname>
                <gpg.passphrase>${env.MAVEN_GPG_PASSPHRASE}</gpg.passphrase>
            </properties>
        </profile>
    </profiles>

</settings>

```



### Step 3: Perform the release
_Preface: Typically I will enable errors and skip tests, but the shorter commands will be listed below for example:_
```
# short version:
mvn release:prepare

# enable errors and skip tests
mvn -e -Darguments="-DskipTests" release:prepare
```


#### Step 3.1: Prepare release
```
mvn release:prepare
```

_Steps perfomed at this stage:_

- **3.1.1**: Update the versions (from snapshot to release), commit it, and attach a tag to this commit
- **3.1.2**: Update the readme and commit it (custom step attached to this stage[*])
- **3.1.3**: Update the versions (from release to the next snapshot) and commit it


[*] This step copies a templated `readme.md` into place, inserting the "current" release
version into the relevant places.


#### Step 3.2: Push to remote repo
```
git push --follow-tags
```

The Maven Release Plugin will attach a tag to the "release" commit. 
This tag **needs** to be pushed to the remote repo, as this tag will be used within `mvn release:perform`


#### Step 3.3: Perform release
```
mvn release:perform
```

_Steps perfomed at this stage:_
- Checkout of the latest tag
- ...



### Step 4: Close and release


## Outstanding Questions

---

### How to remove some of the manual steps?

https://central.sonatype.org/pages/apache-maven.html#performing-a-release-deployment-with-the-maven-release-plugin

---

### How to do the signing stage within a CICD process (e.g. Github Actions)?

---

### Which plugins to use during release}

We currently use the 
[Maven Release Plugin](https://maven.apache.org/maven-release/maven-release-plugin/)
to "prepare" the release, and then to "release" it.

The Sonatype maven plugin looks very promising as an alternative. 
The reason we don't (currently) use it is due to:
- having a step within the `release:prepare` phase that updates the readme, 
- updating versions within the parent/child poms to a "release" version, 
  and then again for the next `-SNAPSHOT` version. 
  
These "blockers" may end up being trivial to overcome.
If so, we may switch over "soon". 


---

### Key Management (a long one with lots of sub-questions)
It is currently unclear (to me) what must be done with the GPG signing keys.

For example: 
#### Q: What _exactly_ is the signing key needed for?
- Is this just to validate between the uploader and OSSRH?
- Is the signature exposed to users who download from/via Maven Central?
- Must keys be maintained as "valid" in perpetuity?
- Does every artifact need to be signed with the same GPG keypair

#### Q: Alternative: What is the consequence for losing the private key?
- There are some examples which demonstrate creating a new GPG within the CICD pipeline,
  discarding the private key once it is uploaded.
  
#### Q: Where are public keys for each specific project/download listed?
- To take advantage of the artifacts being signed, the public key needs to be 
  advertised for users to be able to validate the signature of the downloaded files.
- If this is to be more than a rubber-stamping exercise, "we" (the project team) 
  need to list public keys / make them available.
-  _(related: question below re: multiple keys, and what happened with bintray?)_

#### Q: Does it matter which GPG online key repository is used?
- There are many keyservers online - I have yet to come across documentation about which 
  must/should be used (or which are recognised).
- The [Sonatype documenation] (https://central.sonatype.org/pages/working-with-pgp-signatures.html#distributing-your-public-key)
  includes a code sample which `hkp://pool.sks-keyservers.net` 
- Some alternatives seen within a range of examples online: 
  `keys.gnupg.net`, 
  `sks-keyservers.net`, 
  `pgp.mit.edu`, 
  `keyserver.ubuntu.com`

#### Q: How are multiple keys handled?
- Of course, there isn't necessarily just *one* keypair
- Depending on who performs the release, the private key doing the signing may differ
- Are restrictions in place to require all artifacts to be signed with the same GPG keypair?



Some answers and solutions available, but this 
[StackOverflow question](https://stackoverflow.com/questions/30643188/what-is-the-point-of-mavens-openpgp-signatures-if-anyone-can-create-and-upload)
(not mine) sums it up neatly (quoted below, emphasis mine). 

> 
> **Q: What is the point of maven's OpenPGP signatures if anyone can create and upload any keys?** 
> 
> Sonatype requires the (non-SNAPSHOT version) artifacts to be GPG-signed; the public OpenPGP 
> keys should be uploaded to a (MIT) key server.
> 
> But **anyone can create any OpenPGP key with any name an e-mail and upload them** to the key
> server. There is (as far as I know; or am I wrong?) **no automatic mechanism in place to 
> associate a particular software project/library with a particular public key**. Sure, if
> anyone wants to check the authenticity of the artifacts, one can always request the public
> key from the software authors, or perhaps the key is already published somewhere 
> (in a way that associates it with the particular software project); but since this can not
> be done automatically, hardly anyone ever does it.
>
> So it seems that the whole OpenPGP-signing procedure, also by being quite technical and 
> time-consuming, serves more to instill a false sense of security than actually providing
> much security to the average user.
>
> So shouldn't there be an automatic/streamlined way to associate software projects with 
> OpenPGP keys to make the whole thing actually secure?



---

