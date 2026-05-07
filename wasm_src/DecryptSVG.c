#include <stdio.h>
#include <emscripten.h>
#include <string.h>
#include <stdlib.h>

EMSCRIPTEN_KEEPALIVE
char* decryptSVG(const char* encryptedSVG, const char* crkey) {
    int digitOrd[10] = {48, 49, 50, 51, 52, 53, 54, 55, 56, 57};
    char digitChr[10] = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9'};

    char key[256];
    int e = 0;
    for (int i = 0; crkey[i] != '\0'; i++) {
        e += sprintf(&key[e], "%d", crkey[i]);
    }

    int length = strlen(encryptedSVG);
    char* decrypted = (char*)malloc(length + 1);
    if (!decrypted) return NULL;

    int h = 0, startDecrypt = 0, index = 0;
    for (int i = 0; encryptedSVG[i] != '\0'; i++) {
        char charC = encryptedSVG[i];

        if (charC >= '0' && charC <= '9' && startDecrypt) {
            int r = (charC - '0') - (key[h] - '0');
            if (r < 0) r += 10;
            decrypted[index++] = digitChr[r];
            h = (h + 1) % e;
        } else {
            decrypted[index++] = charC;
            if (charC == '>') startDecrypt = 1;
        }
    }
    decrypted[index] = '\0';
    return decrypted;
}

EMSCRIPTEN_KEEPALIVE
void freeMemory(char* ptr) {
    free(ptr);
}