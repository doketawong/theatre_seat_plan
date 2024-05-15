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
CREATE TABLE public.cinema (
	cinema_id serial4 NOT NULL,
	display_name varchar NULL,
	"location" varchar NULL,
	CONSTRAINT cinema_pkey PRIMARY KEY (cinema_id)
);
INSERT INTO public.cinema(
	cinema_id, display_name, location)
	VALUES (DEFAULT, '嘉禾the sky 奧海城', '西九龍 海庭道18號 奧海城2期 1樓'),
	(DEFAULT, '百老匯 PREMIERE ELEMENTS', '尖沙咀 柯士甸道西1號 圓方商場 2樓火區');


CREATE TABLE public.house (
	house_id serial4 NOT NULL,
	cinema_id serial4 NOT NULL,
	display_name varchar NOT NULL,
	seat varchar NULL,
	CONSTRAINT cinema_house_pkey PRIMARY KEY (house_id)
);
INSERT INTO public.house(
	house_id, cinema_id, display_name, seat)
	VALUES (DEFAULT, 1, 'HOUSE 2', '{"A":[null,null,null,null,null,null,null,null,null,null,null,12,13,14,15,16,17],"B":[null,null,null,4,5,6,null,null,null,null,null,12,13,14,15,16,17],"C":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"D":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"E":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"F":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"G":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"H":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"I":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"J":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"K":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"L":[1,2,3,4,5,6,null,null,9,10,11,12,13,14,15,16,17],"M":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]}');


CREATE TABLE public."event" (
	event_id serial4 NOT NULL,
	event_name varchar NULL,
	event_date timestamp NULL,
	house_id serial4 NOT NULL,
	guest_data varchar NULL,
	seating_plan varchar NULL,
	CONSTRAINT event_pkey PRIMARY KEY (event_id)
);
// form submit with guest.csv






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