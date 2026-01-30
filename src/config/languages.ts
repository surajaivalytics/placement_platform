export const LANGUAGES = {
    cpp: {
        label: "C++",
        judge0_id: 53,
        monaco: "cpp",
        template: `#include<iostream>

using namespace std;

int Addition(int a,int b){
   
}

int main(){
  
    return 0;
}`

    },
    c: {
        label: "C",
        judge0_id: 48,
        monaco: "c",
        template: `#include <stdio.h>
        using namespace std;

                    int main() {

                        return 0;
                    }`
    },

    java: {
        label: "Java",
        judge0_id: 62,
        monaco: "java",
        template: `public class Main {
                        public static void main(String[] args) {

                        }
                    }`

    },

    python: {
        label: "Python",
        judge0_id: 71,
        monaco: "python",
        template: `if __name__ == "__main__":
    print("Start here...")`
    }


}

export type LangaugeKey= keyof typeof LANGUAGES;