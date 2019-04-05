const posts = [{
        title: 'Title of post one',
        body: 'Body of post one'
    },
    {
        title: 'Title of post two',
        body: 'Body of post two'
    }
];

function getPosts() {
    setTimeout(() => {
        for (const post of posts) {
            console.log(`${post.title} : ${post.body}`);
        }
    }, 1000);
}
function createPost(post) {
    setTimeout(() => {
        posts.push(post);
    }, 2000);
}

async function init() {
    await createPost({
        title: 'Title of post three.',
        body: 'Body of post three'
    });

   await getPosts();
}

init();
