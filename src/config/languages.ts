export const LANGUAGES = {
    cpp: {
        label: "C++",
        judge0_id: 53,
        monaco: "cpp",
     

    },

    c: {
        label: "C",
        judge0_id: 48,
        monaco: "c",

    },

    java: {
        label: "Java",
        judge0_id: 62,
        monaco: "java",
      

    },

    python: {
        label: "Python",
        judge0_id: 71,
        monaco: "python",
    }
      

}

export type LangaugeKey= keyof typeof LANGUAGES;