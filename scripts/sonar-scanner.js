import dotenv from 'dotenv';
import process from 'node:process';
import scanner from 'sonarqube-scanner';

// Umgebungsvariable aus .env einlesen
dotenv.config();
const sonarToken = process.env.SONAR_TOKEN;

scanner(
    {
        serverUrl: 'http://localhost:9000',
        options: {
            'sonar.projectName': 'buch',
            'sonar.projectDescription': 'Beispiel fuer Software Engineering',
            'sonar.projectVersion': '2023.1.0',
            'sonar.sources': 'src',
            'sonar.tests': '__tests__',
            'sonar.token': sonarToken,
            'sonar.scm.disabled': 'true',
        },
    },
    () => process.exit(),
);
