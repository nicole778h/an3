package org.example;

class ConvolutionTask implements Runnable {
    private final int startRow, endRow, N, M, K;
    private final int[][] F, C, V;

    ConvolutionTask(int[][] F, int[][] C, int[][] V, int startRow, int endRow, int N, int M, int K) {
        this.startRow = startRow;
        this.endRow = endRow;
        this.N = N;
        this.M = M;
        this.K = K;
        this.F = F;
        this.C = C;
        this.V = V;
    }

    @Override
    public void run() {
        int offset = K / 2;
        for (int i = startRow; i < endRow; i++) {
            for (int j = 0; j < M; j++) {
                int sum = 0;
                for (int u = -offset; u <= offset; u++) {
                    for (int v = -offset; v <= offset; v++) {
                        int x = i + u, y = j + v;
                        if (x >= 0 && x < N && y >= 0 && y < M) {
                            sum += F[x][y] * C[offset + u][offset + v];
                        }
                    }
                }
                V[i][j] = sum;
            }
        }
    }
}