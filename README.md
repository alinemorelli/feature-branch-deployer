# Feature Branch Deployer

- client to manage branchs according to our git flow inspired by [feature branch](https://martinfowler.com/bliki/FeatureBranch.html)

- this is an working in progress repository

## Installation

[npm](https://www.npmjs.com/):

```bash
npm install -g feature-branch-deployer
```

## Usage

##### Create a new testing branch

You can create a new branch based on your development branch and add the branch of the feature to be tested to it.

```bash
featureBranch deploy <baseBranch> <featureBranch>
```
It will generate a branch with the name qa__<featureBranch> and push to your origin.


##### Delete your tested branch

After testing the feature you can delete the test branch from your repository

```bash
featureBranch delete <featureBranch>
```
It will remove the branch named qa__<featureBranch> from remote and origin.