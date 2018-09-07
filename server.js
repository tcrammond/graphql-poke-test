'use strict'
const Pokedex = require('pokedex-promise-v2');
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

const PORT = process.env.PORT || 3005

const server = express()
const db = new Pokedex();

// Transforms pokemon object from pokeapi to friendly format
const pokemonFactory = (pokemon) => {
  return {
    name: pokemon.name,
    url: `https://pokedex.org/#/pokemon/${pokemon.id}`,
    image: pokemon.sprites.front_default,
    abilities: pokemon.abilities.map(({ability}) => ability),
    moves: pokemon.moves
      .filter((move) => {
        return move.version_group_details
          .some((group) => group.move_learn_method.name === 'level-up' && group.version_group.name === 'red-blue')
      })
      .map(({move: {name, url}}) => ({name, url})),
  }
}

/**
 * Fetches all pokemon from pokeapi
 */
function getPokemon () {
  return db
    .getPokemonsList({limit: 150})
    .then((response) => response.results)
}

/**
 * Fetches named pokemon from pokeapi
 * @param {String} name 
 */
function getPokemonByName (name = '') {
  return db
    .getPokemonByName(name)
    .then(pokemonFactory)
}

const abilityType = new GraphQLObjectType({
  name: 'Ability',
  description: 'An ability of a pokemon.',
  fields: {
    name: {
      type: GraphQLString,
      description: 'The name of the ability.'
    }
  }
})

const moveType = new GraphQLObjectType({
  name: 'Move',
  description: 'A move of a pokemon.',
  fields: {
    name: {
      type: GraphQLString,
      description: 'The name of the move.'
    }
  }
})

const pokemonType = new GraphQLObjectType({
  name: 'Pokemon',
  description: 'A pokemon.',
  fields: {
    name: {
      type: GraphQLString,
      description: 'The name of the pokemon.'
    },
    url: {
      type: GraphQLString,
      description: 'Link to the pokemon on pokedex.org.'
    },
    image: {
      type: GraphQLString,
      description: 'URL to the default image.'
    },
    abilities: {
      type: new GraphQLList(abilityType)
    },
    moves: {
      type: new GraphQLList(moveType)
    }
  }
})

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  description: 'The root query type.',
  fields: {
    pokemons: {
      type: new GraphQLList(pokemonType),
      resolve: async () => {
        const pokemon = await getPokemon()
        return pokemon
      }
    },
    pokemon:{
      type: pokemonType,
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString),
          description: 'The name of the pokemon.'
        }
      },
      resolve: async (_, { name }) => {
        const pokemon = await getPokemonByName(name)
        return pokemon
      }
    }
  }
})

const schema = new GraphQLSchema({
  query: queryType
})

server.use('/', graphqlHTTP({
  schema,
  graphiql: true
}))
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})
