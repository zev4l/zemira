import os 

names = os.listdir()
  
files = ""
for elem in names:
    files += '"' + "imagens/iconPacks/sustainableEnergy/" + elem + '"'+ ","

print(files)