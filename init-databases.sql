CREATE USER auth_user      WITH PASSWORD 'secret_auth';
CREATE USER agenda_user    WITH PASSWORD 'secret_agenda';
CREATE USER patients_user  WITH PASSWORD 'secret_patients';
CREATE USER billing_user   WITH PASSWORD 'secret_billing';

CREATE DATABASE auth_db      OWNER auth_user;
CREATE DATABASE agenda_db    OWNER agenda_user;
CREATE DATABASE patients_db  OWNER patients_user;
CREATE DATABASE billing_db   WITH OWNER billing_user;

-- Cada usuario solo puede ver su propia base de datos
REVOKE ALL ON DATABASE auth_db     FROM PUBLIC;
REVOKE ALL ON DATABASE agenda_db   FROM PUBLIC;
REVOKE ALL ON DATABASE patients_db FROM PUBLIC;
REVOKE ALL ON DATABASE billing_db  FROM PUBLIC;