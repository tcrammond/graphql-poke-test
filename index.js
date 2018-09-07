'use strict'

const express = require('express')
const graphqlHTTP = require('express-graphql')
const {
  GraphQLSchema,
  GraphQLList,
  GraphQLID,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType
} = require('graphql')

const nodeInterface = require('./node.js')

const { createVideo, getVideoById, getVideos } = require('./data/index.js')

const PORT = process.env.PORT || 3005
const server = express()


const videoType = new GraphQLObjectType({
  name: 'Video',
  description: 'A video on the site.',
  fields: {
    id: {
      type: GraphQLID,
      description: 'The ID of the video.'
    },
    title: {
      type: GraphQLString,
      description: 'The title of the video.'
    },
    duration: {
      type: GraphQLInt,
      description: 'The duration of the video.'
    },
    watched: {
      type: GraphQLBoolean,
      description: 'Whether the user has watched the video.'
    }
  },
  interfaces: [nodeInterface]
})
exports.videoType = videoType

const videoInputType = new GraphQLInputObjectType({
  name: 'VideoInput',
  fields: {
    title: {type: new GraphQLNonNull(GraphQLString), description: "The title of the video."},
    duration: {type: new GraphQLNonNull(GraphQLInt), description: "The duration of the video in minutes."},
    watched: {type: new GraphQLNonNull(GraphQLBoolean), description: "Whether it has been watched."}
  }
})

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'The root query type.',
  fields: {
    videos: {
      type: new GraphQLList(videoType),
      resolve: getVideos

    },
    video:{
      type: videoType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLID),
          description: 'The ID of the video.'
        }
      },
      resolve: (_, args) => getVideoById(args.id)
    }
  }
})

const mutationType = new GraphQLObjectType({
  name: 'Mutation',
  description: 'The root mutation type.',
  fields: {

    createVideo: {
      type: videoType,
      args: {
        video: {
          type: new GraphQLNonNull(videoInputType)
        }
      },

      resolve: (_, args) => {
        return createVideo(args.video)
      }
    }
  },
  
})

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType
  // subscription
})

const resolvers = {
  video: () => videos[1],
  videos: () => videos
}

server.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})
// graphql(schema, query, resolvers)
  // .then((result) => console.log(JSON.stringify(result)))
  // .catch(console.error)