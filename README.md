Theatre Seating plan
1. Front end
- Print seating plan (Update when seat assigned)
- Mark Seating plan reserved
- Show seats left
- search interface using ig name/ phone
- submit button


2. Backend Logic
- import list of attendance (Sample file in resources folder)
- arrange seat for attendance
    Algorithm:
        Assign seat from behind, left to right
        Avoid separate seat(including aisle)
- mark the attendances seat


3. API
- searchByIg
- searchByPhone
- getSeatLeft
- assignSeat
- importAttendances


4. Table 
- Event
    Date
    Film name
    seating plan
    Attendance (one to many)
- Attendance
    name
    phone
    ig
    number of attendance
    event id (Many to one)
- SeatingPlan
    seating plan json




Database:
create table private_cinema
(
    private_cinema serial
        constraint private_cinema_pk
            primary key,
    seating_plan   bytea
);

CREATE TABLE attendance
(
    id SERIAL
        CONSTRAINT attendance_pk
            PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    seatNo INT NOT NULL
    private_cinema serial
);




Database config:
  host: 'localhost',
  port: 5432,
  database: 'moviematic',
  user: 'postgres',
  password: 'postgres'