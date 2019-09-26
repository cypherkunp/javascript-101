console.log('Before callback');
getUser(1, user => {
  console.log('User:', user);
  getRepositories(user.username, repos => {
    console.log('Repositories:', repos);
    getCommits(repos[0], commits => {
      console.log('Commits:', commits);
    });
  });
});
console.log('After callback');

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
