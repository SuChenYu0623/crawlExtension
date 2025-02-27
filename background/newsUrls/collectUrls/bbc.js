import { sleep } from "../../commonFunc/commonFunc.js";

const cateInfoList = [
  {
    "path": "/news/topics/c2vdnvdg6xxt",
    "collectionId": "0c92b177-4544-4046-9b06-e428e46f72de"
  },
  {
    "path": "/news/war-in-ukraine",
    "collectionId": "555e4b6e-6240-4526-8a00-fed231e6ff74"
  },
  {
    "path": "/news/us-canada",
    "collectionId": "db5543a3-7985-4b9e-8fe0-2ac6470ea45b"
  },
  {
    "path": "/news/england",
    "collectionId": "63315f03-937f-4c96-a58c-405bc8836b71"
  },
  {
    "path": "/news/world/africa",
    "collectionId": "f7905f4a-3031-4e07-ac0c-ad31eeb6a08e"
  },
  {
    "path": "/news/world/asia/china",
    "collectionId": "3d085ce3-0533-4259-8318-b0d550529500"
  },
  {
    "path": "/news/world/asia/india",
    "collectionId": "1a3cd4db-fe3d-46f2-9c9a-927a01b00c91"
  },
  {
    "path": "/news/world/australia",
    "collectionId": "3307dc97-b7f0-47be-a1fb-c988b447cc72"
  },
  {
    "path": "/news/world/europe",
    "collectionId": "e2cc1064-8367-4b1e-9fb7-aed170edc48f"
  },
  {
    "path": "/news/world/latin_america",
    "collectionId": "16d132f4-d562-4256-8b68-743fe23dab8c"
  },
  {
    "path": "/news/world/middle_east",
    "collectionId": "b08a1d2f-6911-4738-825a-767895b8bfc4"
  },
  {
    "path": "/news/in_pictures",
    "collectionId": "1da310d9-e5c3-4882-b7a8-ffc09608054d"
  },
  {
    "path": "/news/bbcverify",
    "collectionId": "9559fc2e-5723-450d-9d89-022b8458cc8d"
  },
  {
    "path": "/business/executive-lounge",
    "collectionId": "0dcffdd7-5bf4-4026-98d6-7107cf752143"
  },
  {
    "path": "/business/technology-of-business",
    "collectionId": "43a57796-e943-46d4-9378-71c65c25f899"
  },
  {
    "path": "/business/future-of-business",
    "collectionId": "61b43b44-ce44-4a44-8633-52721125b3c7"
  },
  {
    "path": "/innovation/technology",
    "collectionId": "092c7c94-aa9b-4933-9349-eb942b3bde77"
  },
  {
    "path": "/innovation/science",
    "collectionId": "ebcca993-0219-4ae3-b574-ef54af9d860d"
  },
  {
    "path": "/innovation/artificial-intelligence",
    "collectionId": "6d032332-6ce5-425b-85a6-f260355718b3"
  },
  {
    "path": "/innovation/ai-v-the-mind",
    "collectionId": "31a9c448-24ff-413e-afc3-bb52f7ddcbc4"
  },
  {
    "path": "/culture/film-tv",
    "collectionId": "472d4624-6af2-4f60-8c4e-04fbfd27b71e"
  },
  {
    "path": "/culture/music",
    "collectionId": "15686dd0-fe09-4c76-b945-ba46a437ef1e"
  },
  {
    "path": "/culture/art",
    "collectionId": "725f0e5f-3088-4d0f-8e28-e8349dd71ecc"
  },
  {
    "path": "/culture/style",
    "collectionId": "7f384459-da99-4f21-bdf7-dcb7da408140"
  },
  {
    "path": "/culture/books",
    "collectionId": "007bab80-dc46-4634-94b5-e4820f6bfd21"
  },
  {
    "path": "/culture/entertainment-news",
    "collectionId": "1b3752e6-3f54-49a5-b4ac-eea4aec017aa"
  },
  {
    "path": "/travel/destinations/africa",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/antarctica",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/asia",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/australia-and-pacific",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/caribbean",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/central-america",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/europe",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/middle-east",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/north-america",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/destinations/south-america",
    "collectionId": "f2ac3f47-3cd7-4a08-98f5-25b6d3947e2c"
  },
  {
    "path": "/travel/worlds-table",
    "collectionId": "9ac84b60-229d-4821-b8b5-acd773eff973"
  },
  {
    "path": "/travel/cultural-experiences",
    "collectionId": "93de7bf1-db6e-4ffe-bfad-d758d5d8d6d6"
  },
  {
    "path": "/travel/adventures",
    "collectionId": "857e427e-fbfe-45b4-a823-a16338a697a8"
  },
  {
    "path": "/travel/specialist",
    "collectionId": "3762c4ea-12aa-4b4b-a878-928b740c0739"
  },
  {
    "path": "/future-planet/natural-wonders",
    "collectionId": "9f0b9075-b620-4859-abdc-ed042dd9ee66"
  },
  {
    "path": "/future-planet/weather-science",
    "collectionId": "696fca43-ec53-418d-a42c-067cb0449ba9"
  },
  {
    "path": "/future-planet/solutions",
    "collectionId": "5fa7bbe8-5ea3-4bc6-ac7e-546d0dc4a16b"
  },
  {
    "path": "/future-planet/sustainable-business",
    "collectionId": "9f0b9075-b620-4859-abdc-ed042dd9ee66"
  },
  {
    "path": "/future-planet/green-living",
    "collectionId": "9f0b9075-b620-4859-abdc-ed042dd9ee66"
  }
]

async function getNewsUrls(collectionId, path, page) {
  return await fetch(`https://web-cdn.api.bbci.co.uk/xd/content-collection/${collectionId}?country=tw&page=${page}&size=9&path=${path}`, {
    "headers": {
      "accept": "*/*",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "priority": "u=1, i"
    },
    "method": "GET",
    "mode": "cors",
    "credentials": "omit"
  }).then(res => res.json())
    .then(res => res.data.map(tmp => (
      {
        newsId: tmp.id?.match(/asset\:([a-zA-Z0-9-]+)/)?.[1],
        url: `https://www.bbc.com${tmp.path}`,
        title: tmp.title,
        postTime: new Date(tmp.firstPublishedAt),
        press: "bbc"
      }
    )))
    .catch(() => [])
}

export async function collectUrls() {
  console.log('bbc collectUrls')
  let urlsList = []
  // 逐個類別去跑
  for (let cateInfo of cateInfoList) {
    const { path, collectionId } = cateInfo  
    if (!collectionId) continue

    // 逐頁去跑
    console.group(`collectionId: ${collectionId}`)
    let page = 1
    while (1) {
      let urls = await getNewsUrls(collectionId, path, page)
      console.log(page, urls)
      if (!urls?.length) break
      if (page > 5) break
      if (urls.find(url => !url.newsId)) break
      urlsList.push(...urls)
      page += 1
      await sleep(2 * 1000)
    }
    console.groupEnd()
  }
  console.log('urlsList:', urlsList)
  return urlsList
}

