#backend project to understand the approa ch behind the backend projects
![alt text](image.png) for the http,  
![alt text](image-1.png)
![alt text](image-2.png)
#Refresh token and Access token Difference

Access token is used to authenticate the user and authorize the user to access the protected resources. Access token is short-lived and should be refreshed periodically.

Refresh token is used to obtain a new access token when the current access token expires. Refresh token is long-lived and should be stored securely.

For example:
when a user Login to some website , we tend to to give an access token to the user and it has a expiry time like 15-30 min, can be anything

when the user try to access some protected resource, the server will check the access token and if it
is expired, the server will return an error message.

soo to fix this , like why login again and again and give new token,
soo refresh token came in place, which have a long-lived tokens, and stored in the database,
and then we check if it has that same refresh token, we just then give them new access token to let them in, rather then making them log in again manually
