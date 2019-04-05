// Named callbacks

console.log('Before callback');
getUser(1, getUserCB);
console.log('After callback');

function getUserCB(user) {
  console.log('User:', user);
  getRepositories(user.username, getRepositoriesCB);
}

function getRepositoriesCB(repos) {
  console.log('Repositories:', repos);
  getCommits(repos[0], getCommitsCB);
}

function getCommitsCB(commits) {
  console.log('Commits:', commits);
}

function getUser(id, callback) {
  setTimeout(() => {
    console.log('Reading the user from a database...');
    callback({ id: id, username: 'devvratio' });
  }, 2000);
}

function getRepositories(username, callback) {
  setTimeout(() => {
    console.log(`Reading the ${username}'s repositories...`);
    callback(['repo1', 'repo2', 'repo3']);
  }, 2000);
}

function getCommits(repoName, callback) {
  setTimeout(() => {
    console.log(`Reading the commits for the repo: ${repoName}`);
    callback(['Commit 1', 'Commit 2', 'Commit 3']);
  }, 2000);
}
