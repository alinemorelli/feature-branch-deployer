# Feature Branch Deployer

- client to manage branchs according to our git flow inspired by [feature branch](https://martinfowler.com/bliki/FeatureBranch.html)

- this is an working in progress repository

## Installation

[npm](https://www.npmjs.com/):

```bash
npm install -g feature-branch-deployer
```

## Usage

All commands listed before should be executed on your repository path

##### Create a new testing branch

You can create a new branch based on your development branch and add the branch of the feature to be tested to it.

```bash
featureBranch deploy <baseBranch> <featureBranch>
```
It will generate a branch with the name qa__{featureBranch}, a tag 'testing' and push to your origin.


##### Delete your tested branch

After testing the feature you can delete the test branch from your repository

```bash
featureBranch remove <featureBranch>
```
It will remove the branch named qa_{featureBranch} from remote and origin.


##### Create a branch without any testing feature

After testing the feature you can create a new branch to clear your qa environment based on your development branch

```bash
featureBranch clear
```
It will create a branch named qa__based on branch dev, a tag 'testing' and pushto your origin.