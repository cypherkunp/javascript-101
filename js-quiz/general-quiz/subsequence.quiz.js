function findSubsequenceCount( S, T)
{
    let m = T.length;
    let n = S.length;

    // T can't appear as a subsequence in S
    if (m > n)
        return 0;

    // mat[i][j] stores the count of
    // occurrences of T(1..i) in S(1..j).
    let mat = [m + 1][n + 1];

    // Initializing first column with
    // all 0s. An emptystring can't have
    // another string as suhsequence
    for (let i = 1; i <= m; i++)
    mat[i][0] = 0;

    // Initializing first row with all 1s.
    // An empty string is subsequence of all.
    for (let j = 0; j <= n; j++)
    mat[0][j] = 1;

    // Fill mat[][] in bottom up manner
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            // If last characters don't match,
            // then value is same as the value
            // without last character in S.
            if (T.charAt(i - 1) != S.charAt(j - 1))
                mat[i][j] = mat[i][j - 1];

            // Else value is obtained considering two cases.
            // a) All substrings without last character in S
            // b) All substrings without last characters in
            // both.
            else
                mat[i][j] = mat[i][j - 1] + mat[i - 1][j - 1];
        }
    }

    /* uncomment this to prlet matrix mat
    for (let i = 1; i <= m; i++, cout << endl)
        for (let j = 1; j <= n; j++)
            System.out.prletln ( mat[i][j] +" "); */
    return mat[m][n];
}