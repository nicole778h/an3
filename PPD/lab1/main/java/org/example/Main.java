package org.example;

import java.io.*;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    static int[][] zeroPadMatrix(int[][] matrix, int K) {
        int N = matrix.length;
        int M = matrix[0].length;
        int pad = K / 2; // Marginea este de dimensiune K/2
        int[][] paddedMatrix = new int[N + 2 * pad][M + 2 * pad]; // Matracia cu margini

        // Umple matricea cu zero
        for (int i = 0; i < N + 2 * pad; i++) {
            for (int j = 0; j < M + 2 * pad; j++) {
                paddedMatrix[i][j] = 0;
            }
        }

        // Copiază matricea originală în matricea bordată
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < M; j++) {
                paddedMatrix[i + pad][j + pad] = matrix[i][j];
            }
        }

        return paddedMatrix;
    }

    // Citire matrice din fișier
    static int[][] readMatrix(BufferedReader reader, int rows, int cols) throws IOException {
        int[][] matrix = new int[rows][cols];
        for (int i = 0; i < rows; i++) {
            String line = reader.readLine();
            System.out.println("Linia citita: '" + line + "'"); // Afișează linia exactă citită
            if (line == null || line.trim().isEmpty()) {
                throw new IOException("Linia " + (i + 1) + " din fisier este goala sau nu contine date valide.");
            }

            // Curăță caracterele invizibile și spațiile suplimentare
            line = line.replaceAll("[^\\x20-\\x7e]", "").trim();

            String[] lineParts = line.split(" ");
            System.out.println("Numar elemente: " + lineParts.length); // Afișează câte elemente sunt pe linie

            // Verifică dacă linia conține exact numărul de elemente așteptate
            if (lineParts.length != cols) {
                throw new IOException("Linia " + (i + 1) + " din fisier nu contine exact " + cols + " elemente.");
            }

            for (int j = 0; j < cols; j++) {
                try {
                    matrix[i][j] = Integer.parseInt(lineParts[j]);
                } catch (NumberFormatException e) {
                    throw new IOException("Eroare la citirea valorii '" + lineParts[j] + "' în linia " + (i + 1) + ".");
                }
            }
        }
        return matrix;
    }

    // Scriere matrice într-un fișier
    static void writeMatrix(int[][] matrix, String filename) throws IOException {
        BufferedWriter writer = new BufferedWriter(new FileWriter(filename));
        for (int[] row : matrix) {
            for (int elem : row) {
                writer.write(elem + " ");
            }
            writer.newLine();
        }
        writer.close();
    }


    // Convoluție secvențială
    //pt fiecare element din matricea de iesire, se parcurg vecinatatiile din matricea de intrare F
    //care sunt acoperite de kernel-ul C[offset + u][offset + v], unde offset = K / 2.
    //se aduna produsele

    static int[][] convolveSequential(int[][] F, int[][] C, int N, int M, int K) {
        int[][] V = new int[N][M];
        int offset = K / 2;
        for (int i = 0; i < N; i++) {
            for (int j = 0; j < M; j++) {
                int sum = 0;
                for (int u = -offset; u <= offset; u++) {
                    for (int v = -offset; v <= offset; v++) {
                        int x = i + u, y = j + v;
                        if (x >= 0 && x < N && y >= 0 && y < M) { //verific limitele randurilor si coloanelor pentru fiecare acces la elementele matricii
                            sum += F[x][y] * C[offset + u][offset + v];
                        }
                    }
                }
                V[i][j] = sum;
            }
        }
        return V;
    }

    // Task pentru paralelizarea convoluției
    static class ConvolutionTask implements Runnable {
        int[][] F, C, V;
        int startRow, endRow, N, M, K;

        ConvolutionTask(int[][] F, int[][] C, int[][] V, int startRow, int endRow, int N, int M, int K) {
            this.F = F;
            this.C = C;
            this.V = V;
            this.startRow = startRow;
            this.endRow = endRow;
            this.N = N;
            this.M = M;
            this.K = K;
        }
//la cel paralel fiecare thread se ocupe de un subset de randuri
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

    // Convoluție paralelă
    static void convolveParallel(int[][] F, int[][] C, int[][] V, int N, int M, int K, int p) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(p);
        int chunkSize = N / p;
        int remainder = N % p;

        int startRow = 0;
        for (int i = 0; i < p; i++) {
            int endRow = startRow + chunkSize + (i < remainder ? 1 : 0);
            executor.execute(new ConvolutionTask(F, C, V, startRow, endRow, N, M, K));
            startRow = endRow;
        }

        executor.shutdown();
        while (!executor.isTerminated()) {
            Thread.sleep(10);
        }
    }

    // Metodă pentru generarea unei matrice aleatoare
    static int[][] generateRandomMatrix(int rows, int cols) {
        Random random = new Random();
        int[][] matrix = new int[rows][cols];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                matrix[i][j] = random.nextInt(10); // Valori între 0 și 9
            }
        }
        return matrix;
    }

    // Metodă pentru testarea performanței
    static void testPerformance() throws IOException, InterruptedException {
        // Dimensiuni și număr de fire pentru testare
        int[][] matrixSizes = {{10, 10}, {100, 100}, {1000, 1000}};
        int[] kernelSizes = {3, 5};
        int[] threadCounts = {1, 2, 4, 8, 16};

        // Deschide un fișier CSV pentru a salva rezultatele
        BufferedWriter csvWriter = new BufferedWriter(new FileWriter("performance.csv"));
        csvWriter.write("MatrixSize,KernelSize,Threads,ExecutionTime(ms)\n");

        System.out.printf("%-15s %-12s %-10s %-10s\n", "Matrix Size", "Kernel Size", "Threads", "Execution Time (ms)");

        for (int[] size : matrixSizes) {
            int N = size[0], M = size[1];

            for (int K : kernelSizes) {
                int[][] F = generateRandomMatrix(N, M);
                int[][] C = generateRandomMatrix(K, K);
                int[][] V = new int[N][M];

                for (int p : threadCounts) {
                    boolean isSequential = (p == 1);

                    // Măsoară timpul de execuție
                    long startTime = System.nanoTime();
                    if (isSequential) {
                        V = convolveSequential(F, C, N, M, K);
                    } else {
                        convolveParallel(F, C, V, N, M, K, p);
                    }
                    long endTime = System.nanoTime();
                    long duration = (endTime - startTime) / 1_000_000; // Convertim în milisecunde

                    // Afișare și scriere rezultate
                    System.out.printf("%-15s %-12d %-10d %-10d\n", N + "x" + M, K, p, duration);
                    csvWriter.write(N + "x" + M + "," + K + "," + p + "," + duration + "\n");
                }
            }
        }
        csvWriter.close();
    }

    // Funcția principală
    public static void main(String[] args) throws IOException, InterruptedException {
        if (args.length < 1) {
            System.out.println("Utilizare: java Main <nr_threaduri> [--test]");
            return;
        }

        // Verificăm dacă se cere rularea testelor
        if (args.length > 1 && args[1].equals("--test")) {
            testPerformance(); // Rulează testele de performanță
            return;
        }

        int p = Integer.parseInt(args[0]); // Număr de thread-uri
        boolean isSequential = (p == 1);  // Rulează secvențial dacă p=1

        // Citire date din fișier
        BufferedReader reader = new BufferedReader(new FileReader("C:\\Users\\Galdeanu\\Desktop\\facultate\\an3\\sem1\\ppd\\lab1\\build\\classes\\java\\main\\org\\example\\date.txt"));
        String[] firstLine = reader.readLine().split(" ");
        int N = Integer.parseInt(firstLine[0]);
        int M = Integer.parseInt(firstLine[1]);
        int K = Integer.parseInt(firstLine[2]);

        int[][] F = readMatrix(reader, N, M);  // Citirea matricei F
        int[][] C = readMatrix(reader, K, K);  // Citirea matricei de convoluție C
        reader.close();

        int[][] V = new int[N][M];

        // Calcul convoluție
        long startTime = System.nanoTime(); //  nanoTime pentru măsurarea timpului
        if (isSequential) {
            V = convolveSequential(F, C, N, M, K);
        } else {
            convolveParallel(F, C, V, N, M, K, p);
        }
        long endTime = System.nanoTime(); // Masurare finală

        // Afișare timp de rulare
        long duration = (endTime - startTime) / 1000000; // Convertește din nanosecunde în milisecunde
        System.out.println("Time+ " + duration + "ms");

        // Salvare matrice rezultat
        writeMatrix(V, "output.txt");
    }
}
