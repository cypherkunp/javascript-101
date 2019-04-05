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
        posts.forEach((post) => {
            console.log(`${post.title} : ${post.body}`);
        })
    }, 1000);
}

function createPost(post, callback) {
    setTimeout(() => {
        posts.push(post);
        if(callback && typeof callback === 'function'){
            callback();
        }
    }, 2000);
}
createPost({title: 'Title of post three', body: 'Body of post three'}, getPosts);