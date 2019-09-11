// src/schema/movie.js
import { makeExecutableSchema } from 'graphql-tools'
import http from 'request-promise-json'

const MOVIE_DB_API_KEY = process.env.MOVIE_DB_API_KEY;

// be careful » typeDefs start with backtick!!
const typeDefs = `
  type Company {
      id: ID!
      logo_path: String!
      name: String!
      origin_country: String!
  }

  enum Currency {
    EUR
    GBP
    USD
  }

  type Movie {
    id: ID!
    imdb_id:String
    title: String!
    budget(currency: Currency = EUR): Int
    release_date: String!
    production_companies: [Company!]!
    vote_count: Int
    rating: Int
  }

  type Query {
    movies: [Movie]
    ratedMovies: [Movie]
    movie(id: ID, imdb_id: String): Movie
  }

  input RatingInput {
    value: Int!
    comment: String!
  }
  
  type Mutation {
    rateMovie (id: ID!, rating: RatingInput!): Int
  }
`;

const resolvers = {
  Query: {
    movie: async (obj, args, context, info) => {
      if (args.id) {
        return http
          .get(`https://api.themoviedb.org/3/movie/${args.id}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
      }
      if (args.imdb_id) {
        const results = await http
          .get(`https://api.themoviedb.org/3/find/${args.imdb_id}?api_key=${MOVIE_DB_API_KEY}&language=en-US&external_source=imdb_id`)

        if (results.movie_results.length > 0) {
          const movieId = results.movie_results[0].id
          return http
            .get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${MOVIE_DB_API_KEY}&language=en-US`)
        }
      }
    },

    // not async
    // movies: (obj, args, context, info) => {
    //   // TODO: implement this
    //     return http
    //       .get(`https://api.themoviedb.org/3/discover/movie?sort_by=popularity.des&api_key=${MOVIE_DB_API_KEY}&language=en-US`)
    //       .then(result => {
    //         const { results } = result
            
    //         return results
    //       })
    // },

    // async
    movies: async (obj, args, context, info) => {
      console.log("args test:", args)
      // TODO: implement this
      // the if (args) not neccessary » empty object »
      // we are not using arguments in the type Query »
      // movies: [Movie] » checked it with console.log
      // if (args) {
        // review the rules » ? vs & in the URL!!!
        const result = await http .get(`https://api.themoviedb.org/3/discover/movie?sort_by=popularity.des&api_key=${MOVIE_DB_API_KEY}&language=en-US`)
        const { results } = result
        return results
      // } » because of the commented out if (args) line...
      },
    
    ratedMovies: async (obj, args, context, info) => {
      const guest_session = await getSessionId()
      const ratedMoviesUrl = await http.get(`https://api.themoviedb.org/3/guest_session/${guest_session}/rated/movies?api_key=${MOVIE_DB_API_KEY}&language=en-US`) 
      const { results } = ratedMoviesUrl
      return results
    }
  },

  Mutation: {
    rateMovie: async (obj, args, context, info) => {
      console.log('mutation args test:', args)
      const guest_session = await getSessionId()
      return await http.post(
        `https://api.themoviedb.org/3/movie/${args.id}/rating?api_key=${MOVIE_DB_API_KEY}&guest_session_id=${guest_session}&language=en-US`,
        args.rating
      ).then(result => {
        return args.rating.value
      })
      .catch(error => {
        console.log(error)
      })
    }
  }
}

// Add this helper function to create a guest session.
let guestSessionObj
async function getSessionId() {
  guestSessionObj =
    guestSessionObj ||
    (await http.get(
      `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${MOVIE_DB_API_KEY}&language=en-US`
    ))
  return guestSessionObj["guest_session_id"]
}


const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default schema