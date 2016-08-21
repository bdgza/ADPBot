import cmd
import sys
import json
import string

def main():
    file = open(sys.argv[1], 'r')
    jsonstr = file.read()
    file.close()
        
    from os.path import expanduser
    home = expanduser("~")

    with open(home + "/vassal-raw.json", "w") as text_file:
        text_file.write(jsonstr)

if __name__ == "__main__":
    main()