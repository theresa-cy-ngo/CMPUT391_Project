DROP TABLE image_tracking;
DROP VIEW data_analysis;

CREATE TABLE image_tracking (
    photo_id int,
    user_name varchar(24),
    FOREIGN KEY (photo_id) REFERENCES images,
    FOREIGN KEY (user_name) REFERENCES users
);

CREATE OR REPLACE VIEW data_analysis AS
  	SELECT I.PHOTO_ID, P.USER_NAME, I.SUBJECT, I.TIMING
  	FROM IMAGES I, PERSONS P
  	WHERE I.OWNER_NAME = P.USER_NAME;
