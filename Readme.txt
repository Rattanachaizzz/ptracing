---------------------------------------------------------------------------------
|                                    API DETAULS                                |
---------------------------------------------------------------------------------
1. UpdateLambdaSetting ---> UpdateConfig
request body (json)
{ 
    "truck": [2], 
    "la_less_than" : 2, 
    "duration":2
}

respone body (text)
Update Configurations Success!
---------------------------------------------------------------------------------
2. CalibateGforce      ---> CalibateGforce
request body (json)
{ 
    "truck" : [2,3]
}

respone body (text)
Calibate Gforce of truck 2,3 Success!
---------------------------------------------------------------------------------
3. ResetLambdaCount    ---> ResetLambdaCount
request body (json)
{ 
    "truck" : [1,2]
}

respone body (text)
Reset Lambda Count Success!
---------------------------------------------------------------------------------
4. Reports             ---> TruckReports
request body (x-www-form-urlencoded)
truck_id : 1
dateTime : "2024-06-01T16:25:00.000"

respone body (text)
.csv file
---------------------------------------------------------------------------------
5. SetDetail           ---> SetDetail
request body (json)
{
    "truck" : [1,2]
}

respone body (text)
Reset Lambda Count Success!
---------------------------------------------------------------------------------
6. GetAllCar
request body (json)
none

respone body (text)
[
    {
        "car" : 1,
        "name" : "A301",
        "description" : "ISUZU"
    },
    {
        "car" : 2,
        "name" : "A302",
        "description" : "ISUZU"
    }
]
---------------------------------------------------------------------------------