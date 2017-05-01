var axios = require('axios');
var id = "a403c714f63040d2f1b7";
var sec = "bb631c2c8d6faf9edd51a041488317886a2d1829";
var params = "?client_id=" + id + "&client_secret=" + sec;
function getProfile(username){
  return axios.get('https://api.github.com/users/' + username + params)
    .then(function(user){
      return user.data;
    });
}

function getRepos(username){
  return axios.get('https://api.github.com/users/' + username + '/repos' + params + '&per_page=100');
}

function getStarCount(repos){
  return repos.data.reduce(function(count, repo){
    return count + repo.stargazers_count;
  }, 0)
}

function calculateScore(profile, repos){
  var followers = profile.followers;
  var totalStars = getStarCount(repos);
  return (followers * 3) + totalStars;
}

function handleError(error){
  console.warn(error)
  return null;
}

function getUserData(player){
  return axios.all([
    getProfile(player),
    getRepos(player)
  ]).then(function(data){
    var profile = data[0];
    var repos = data[1];

    return {
      profile: profile,
      score: calculateScore(profile, repos)
    }
  })
}

function sortPlayers(players){
  return players.sort(function(a,b){
    return b.score - a.score;
  });
}

module.exports = {
  battle: function(players){
    return axios.all(players.map(getUserData))
      .then(sortPlayers)
      .catch(handleError)
  },
  fetchPopularRepos: function (language) {
    var encodedURI = window.encodeURI('https://api.github.com/search/repositories?q=stars:>1+language:'+ language + '&sort=stars&order=desc&type=Repositories');

    return axios.get(encodedURI)
      .then(function(response){
        console.log(response)
        return response.data.items;
      })
  }
}
