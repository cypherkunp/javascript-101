var iMax = 20;
var jMax = 10;
var f = new Array();

for (i = 0; i < iMax; i++) {
    f[i] = new Array();
    for (j = 0; j < jMax; j++) {
        f[i][j] = 0;
    }
}

for (i = 0; i < iMax; i++) {
    for (j = 0; j < jMax; j++) {
        console.log(f[i][j]);
    }
}
