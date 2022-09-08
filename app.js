const express=require("express")
const path=require("path")
const sqlite3=require("sqlite3")
const {open}=require("sqlite")

const app=express();

app.use(express.json);

const dbPath=path.join(__dirname,"moviesData.db");
let dataBase=null;

const initializeTheDataBase=async ()=>{
    try{
        dataBase=await open({
            filename:dbPath,
            driver:sqlite3.driver
        })
        app.listen(3000,()=>{
            console.log("Server is running")
        })

    }
    catch(error){
        console.log(error.message)
        process.exit(1);
    }
}

initializeTheDataBase();

const convertDbobjectToResponseobject=(data)=>{
    return{
         "movieId": data.movie_id,
       "directorId": data.director_id,
         "movieName": data.movie_name,
         "leadActor": data.lead_actor
    }
}

app.get("/movies/",async (request,response)=>{
    const moviesQuery=`
    SELECT movie_name FROM movie
    `
    const movieList=await dataBase.all(moviesQuery);
    response.send(movieList.map(eachMovie)=>
        convertDbobjectToResponseobject(eachMovie))
})

app.post("/movies/",async (request,response)=>{
    const {directorId,movieName,leadActor}=request.body;
    const moviesQuery=`
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},${movieName},${leadActor})
    `
    const movieList=await dataBase.run(moviesQuery);
    response.send("Movie Successfully Added")
})

app.get("/movies/:movieId/",async (request,response)=>{
    const {movieId}=request.params;
    const moviesQuery=`
    SELECT * FROM movie
    WHERE movie_id=${movieId}
    `
    const movieList=await dataBase.all(moviesQuery);
    response.send(movieList.map(eachMovie)=>
        convertDbobjectToResponseobject(eachMovie))
})

app.put("/movies/:movieId/",async (request,response)=>{
    const {directorId,movieName,leadActor}=request.body;
    const moviesQuery=`
    UPDATE movie SET
     director_id=${directorId},
     movie_name=${movieName},
     lead_actor=${leadActor}
    `
    const movieList=await dataBase.run(moviesQuery);
    response.send("Movie  Details Updated")
})

app.delete("/movies/:movieId/",async (request,response)=>{
    const {movieId}=request.params;
    const moviesQuery=`
    DELETE FROM movie
    WHERE movie_id=${movieId}
    `
    const movieList=await dataBase.run(moviesQuery);
    response.send("Movie Removed")
});

const convertDbobjectToResponseobjectDirector=(directorData)=>{
    return{
        "directorId":directorData.director_id,
        "directorName":directorData.director_name
    }
};

app.get("/directors/",async (request,response)=>{
    const directorQuery=`
    SELECT * FROM director
    `
    const directorsList=await dataBase.all(moviesQuery);
    response.send(directorsList.map(director)=>
        convertDbobjectToResponseobjectDirector(director))
})

app.get("/directors/:directorId/movies/",async (request,response)=>{
    const {directorId}=request.params;
    const moviesQuery=`
    SELECT movie_name FROM movie WHERE director_id=${directorId}
    `
    const movieList=await dataBase.all(moviesQuery);
    response.send(movieList.map(eachMovie)=>
        convertDbobjectToResponseobject(eachMovie))
})

module.exports=app;