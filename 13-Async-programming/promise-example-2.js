// Named callbacks, to eliminate nested callback hell

console.log('Before callback');
getUser(1)
  .then(user => getRepositories(user.username))
  .then(repos => getCommits(repos[0]))
  .then(commits => console.log(commits))
  .catch(err => console.log(err));

console.log('After callback');

function getUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('Reading the user from a database...');
      resolve({ id: id, username: 'devvratio' });
    }, 2000);
  });
}

function getRepositories(username) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Reading the ${username}'s repositories...`);
      resolve(['repo1', 'repo2', 'repo3']);
    }, 2000);
  });
}

function getCommits(repoName) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`Reading the commits for the repo: ${repoName}`);
      resolve(['Commit 1', 'Commit 2', 'Commit 3']);
    }, 2000);
  });
}
