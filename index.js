import {ApolloServer} from '@apollo/server'
import {startStandaloneServer} from '@apollo/server/standalone'
import {movies,movieAbout,movieWriters} from './fakeDB.js'
import {randomBytes} from 'crypto'

const typeDefs = `
    type movieSchema{
        id:ID!
        name:String!
        ratings:Float!
        duration:Float!
        director:String!
        stars:[String!]! 
    }

    type aboutMovieSchema{
        movieId:ID!
        about:String   
    }

    type writersSchema{
        writerId:ID!
        writer:[String!]!
    }

    type Mutation{
        createNewMovie(insertNewMovie:movieInput!):movieSchema!
        upDateMovieName(updateMovie:updateMovieName!):movieSchema!
    }

    input movieInput{
        name:String = "No Movie"
        duration:Float = 0.00
        ratings:Float = 0.00
        stars:[String!]! = "No Stars"
        director:[String!]! = "No Director"
    }

    input updateMovieName{
        id:String!
        newMovieName:String
    }

    type Query{
        showMovies:[movieSchema]
        showMovieAbout:[aboutMovieSchema]
        showWritersSchema:[writersSchema]
        searchMovieFromName(id:String):movieSchema
        searchMovieFromId(id:String):movieSchema
    }
`

const resolvers = {
    Query:{
        showMovies:()=>movies,
        showMovieAbout:()=>movieAbout,
        showWritersSchema:()=>movieWriters,
        searchMovieFromName:(_,args)=>{
            let i=0;
            while(i<movies.length){
                if(movies[i].name.toLocaleLowerCase().split(' ').join('')===args.id.toLocaleLowerCase().split(' ').join('')){
                    return movies[i];
                }
                i++;
            }
        },
        searchMovieFromId:(_,args)=> movies.find(movie=>movie.id===args.id),
    },
    Mutation:{
        createNewMovie:(parent,args)=>
        {
           let user = args.insertNewMovie
           let id=randomBytes(4).toString('hex')
           let coll = {id,...user}
           movies.push(coll);
           return movies.filter(movie=>movie.id==id)    
        },
        upDateMovieName:(parent,args)=>{
            const {id,newMovieName} = args.updateMovie
            let movieUpdated;
            movies.forEach(movie=>{
                if(movie.id===id){
                    movie.name=newMovieName
                    movieUpdated=movie
                }
            })

            return movieUpdated;
        }

    }
}


const server = new ApolloServer({
        typeDefs,
        resolvers
})

const {url} = await startStandaloneServer(server,{
    listen:{port:4000}
})

console.log('Server is running at the '+url);