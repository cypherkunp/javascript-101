function Movie(movieName, actors, director, duration) {
    this.movieName = movieName;
    this.actors = actors;
    this.director = director;
    this.duration = duration;
}

Movie.prototype.play = function () {
    console.log('playing the movie > ' + this.movieName);
}
Movie.prototype.pause = function () {
    console.log('pausing the movie > ' + this.movieName);
};
Movie.prototype.stop = function () {
    console.log('stoped playing the movie > ' + this.movieName);
};
Movie.prototype.details = function () {
    console.log('------------------------------------');
    console.log('Name of the movie: ' + this.movieName);
    console.log('Cast of the movie: ' + this.actors);
    console.log('Directed by:' + this.director);
    console.log('Duration of the movie: ' + this.duration + 'mins');
    console.log('------------------------------------');
};

let pulpfiction = new Movie(
    'Pulp Fiction',
    ['Uma Thurman', 'Samuel L. Jackson', 'Jhon Travolta'],
    'Quentin Tarantino',
    '130'
);
pulpfiction.details();
console.log();
pulpfiction.play();
pulpfiction.stop();