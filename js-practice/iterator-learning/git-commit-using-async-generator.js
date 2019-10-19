const axios = require('axios');
const repoURL = `devvratshukla/devvratshukla.github.io`;

async function getGitCommits(repo) {
    const url = `https://api.github.com/repos/devvratshukla/devvratshukla.github.io/commits`;
    let response = null;

    try {
        response = await axios.get(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        response.data.forEach(element => {
            console.log(element.commit.message);
        });
    } catch (error) {
        console.log(error.message);
    }
}

getGitCommits();
