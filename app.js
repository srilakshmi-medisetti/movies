const express=require("express")
const app=express()
const {open}=require("sqlite")
const sqlite3=require("sqlite3")

const path=require("path")
const databasePath=path.join(__dirname,"moviesData.db")
app.use(express.json());
let database=null;

const initializeDbAndServer=async () =>{
    try{
        database=await open({
            filename: databasePath,
            driver:sqlite3.Database,
        });
        app.listen(3000, () =>
        console.log("Server Running at http://localhost:3000/"));
}catch (error){
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
}
};
initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) =>{
    return {
        movieId: dbObject.movie_id,
        directorId: dbObject.director_id,
        movieName: dbObject.movie_name,
        leadActor: dbObject.lead_actor
    }
}
const convertDirectorDbObjectToResponseObject= (dbObject)=>{
    return{
        directorId : dbObject.director_id,
        directorName : dbObject.director_name,
    }
}

app.get("/movies/", async (request,response)=>{
    const getMoviesQuery=`SELECT movie_name FROM movie;`;
    const moviesArry = await database.all(getMoviesQuery);
    response.send(moviesArry.map((eachMovie)=>({movieName:eachMovie.movieName}))
    );
})
app.get("/movies/:movieId/",async (request,response)=>{
    const {movieId}=request.params;
    const getMovieQuery=`SELECT * FROM movie WHERE movie_id =${movieId};`;
    const movie=await database.get(getMovieQuery);
    response.send(convertMovieDbObjectToResponseObject(movie))
});
app.post("/movies/", async (request ,response)=>{
    const {directorId , movieName, leadActor}=request.body;
    const postMovieQuery =`INSERT INTO movies (dirctor_id, movie_name,lead_actor) VALUES (${directorId},"${movieName}","${leadActor}");`
    await database.run(postMovieQuery);
    response.send("Movie Successfully Added");
});
app.put("?movies/:movieId/",async (request,response)=>{
    const {directorId,movieName,leadActor}=request.body;
    const {movieId} =request.params;
    const updateMovieQuery=`UPDATE  movie SET director_id=${directorId},movie_name = "${movieNAme}",lead_actor="${leadActor}" WHERE  movie_id=${movieId};`;
    await database.run(updateMovieQuery);
    reponse.send("Movie Details Updated")
})
app.delete ("movies/:movieID/",async (request ,response)=>{
    const {movieId}=request.params;
    const deletemovieQuery=`DELETE FROM movie WHERE movie_id =${movieId};`;
    await database.run(deletemovieQuery);
    response.send("Movie Removied");
})

app.get("/directors/", async (request,response)=>{
    const getDirectorsQuery=`SELECT * FROM director;`;
    const directorsArry = await database.all(getDirectorsQuery);
    response.send(directorsArry.map((eachDirector)=>(convertDirectorDbObjectToResponseObject(eachDirector)
    )
    )
    });
app.get("/directors/:directorId/movies/",async (request,response)=>{
    const {directorId} =request.params;
    const getDirectorsMovieQuery=`SELECT movie_name FROM movie WHERE director_id="${directorId}";`;
    const moviesArray=await database.all(getDirectorsMovieQuery);
    response.send(moviesArray.map((eachMovie)=>({movieName:eachMovie.movie_name

    }))
    )
})

module.exports=app;
    