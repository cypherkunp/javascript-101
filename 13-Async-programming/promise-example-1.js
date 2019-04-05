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
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            posts.push(post);
            const error = false;
            if (!error) {
                resolve();
            } else {
                reject('Error: Something went wrong');
            }
        }, 2000);
    });
}

createPost({
        title: 'Title of post three.',
        body: 'Body of post three'
    })
    .then(getPosts)
    .catch(err => console.log(err));


// Promise.all() 
const promise1 = 10;
const promise2 = new Promise((resolve, reject) => {
    setTimeout(resolve, 5000, 'Promise You!');
});

Promise.all([promise1, promise2]).then(values => console.log(values));
