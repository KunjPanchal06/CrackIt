/**
 * Default LaTeX resume template.
 * Pre-filled when users create a new resume.
 * Uses a clean, professional single-column layout.
 */
export const DEFAULT_LATEX_TEMPLATE = String.raw`%-------------------------
% CrackIt Resume Template
% Based on a clean, ATS-friendly design
%-------------------------

\documentclass[letterpaper,11pt]{article}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{lmodern}
\usepackage[margin=0.75in]{geometry}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{xcolor}

% ---------- Formatting ----------
\pagestyle{empty}
\raggedbottom
\setlength{\parindent}{0pt}
\setlength{\parskip}{0pt}

% Section formatting
\titleformat{\section}{
  \vspace{-6pt}\scshape\large\bfseries
}{}{0em}{}[\color{black}\titlerule\vspace{-4pt}]

% List formatting
\setlist[itemize]{nosep, leftmargin=1.5em, label=\textbullet}

% ---------- Custom Commands ----------
\newcommand{\resumeHeading}[4]{
  \vspace{-1pt}
  \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
    \textbf{#1} & #2 \\
    \textit{#3} & \textit{#4} \\
  \end{tabular*}
  \vspace{-5pt}
}

\newcommand{\resumeProject}[2]{
  \vspace{-1pt}
  \begin{tabular*}{\textwidth}[t]{l@{\extracolsep{\fill}}r}
    \textbf{#1} & #2 \\
  \end{tabular*}
  \vspace{-5pt}
}

% ==========================================
\begin{document}

% ---------- Header ----------
\begin{center}
  {\LARGE \textbf{Your Name}} \\[4pt]
  \href{mailto:your.email@example.com}{your.email@example.com} \quad
  \href{tel:+11234567890}{(123) 456-7890} \quad
  \href{https://linkedin.com/in/yourprofile}{linkedin.com/in/yourprofile} \quad
  \href{https://github.com/yourgithub}{github.com/yourgithub}
\end{center}

% ---------- Education ----------
\section{Education}
\resumeHeading
  {University Name}{City, State}
  {Bachelor of Science in Computer Science}{Expected May 2026}
\begin{itemize}
  \item \textbf{GPA:} 3.8/4.0
  \item \textbf{Relevant Coursework:} Data Structures, Algorithms, Machine Learning, Database Systems
\end{itemize}

% ---------- Experience ----------
\section{Experience}
\resumeHeading
  {Software Engineering Intern}{May 2025 -- Aug 2025}
  {Company Name}{City, State}
\begin{itemize}
  \item Developed a full-stack web application using React and Node.js, serving 500+ daily users
  \item Optimized database queries reducing API response times by 40\%
  \item Collaborated with a cross-functional team of 8 engineers in an Agile environment
\end{itemize}

\resumeHeading
  {Teaching Assistant}{Jan 2025 -- May 2025}
  {University Name}{City, State}
\begin{itemize}
  \item Led weekly office hours and review sessions for 60+ students in Data Structures
  \item Created automated grading scripts in Python, reducing grading time by 50\%
\end{itemize}

% ---------- Projects ----------
\section{Projects}
\resumeProject{Project Name | \normalfont\textit{React, Python, PostgreSQL}}{2025}
\begin{itemize}
  \item Built a full-stack application with user authentication and real-time data processing
  \item Implemented CI/CD pipeline with GitHub Actions, achieving 95\% test coverage
  \item Deployed on AWS EC2 with Docker, handling 1000+ concurrent requests
\end{itemize}

\resumeProject{Another Project | \normalfont\textit{Python, TensorFlow, Flask}}{2024}
\begin{itemize}
  \item Trained a machine learning model achieving 92\% accuracy on classification task
  \item Developed a REST API to serve predictions with sub-100ms latency
\end{itemize}

% ---------- Technical Skills ----------
\section{Technical Skills}
\begin{itemize}[leftmargin=0.5em, label={}]
  \item \textbf{Languages:} Python, JavaScript, TypeScript, Java, SQL, HTML/CSS
  \item \textbf{Frameworks:} React, Node.js, Express, FastAPI, Django
  \item \textbf{Tools:} Git, Docker, AWS, PostgreSQL, MongoDB, Redis
  \item \textbf{Concepts:} REST APIs, CI/CD, Agile, Data Structures, System Design
\end{itemize}

\end{document}
`;
