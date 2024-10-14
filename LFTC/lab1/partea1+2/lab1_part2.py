import re


#deschid pentru citire
with open("input.txt", "r") as fisier:
    continut = fisier.read()  # citesc tot fisierul

# impart la spatii
cuvinte = continut.split()

# Afisez lista de cuvinte
print(cuvinte)

