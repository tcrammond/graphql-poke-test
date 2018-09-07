# graphql-poke-test

A test project of GraphQL.

## Setup

`npm install`

## Running the API

`npm run start`

Visit `http://localhost:3005` and start quering with graphiql interface.

Example query showing the scope of what is available:

```graphql
{
  pokemon(name: "zubat") {
    name,
    image,
    url,
    abilities {
      name
    },
    moves {
      name
    }
  }
  pokemons {
    name
  }
}
```