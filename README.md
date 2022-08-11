
# Astaroid-backend

The official backend framework for the astaroid platform, written in [svelte-kit](https://kit.svelte.dev/), deployed to [netlify](https://www.netlify.com/) and used [supabase](https://supabase.com/) for database(postgres database), authentication and storage.

- [Astaroid-backend](#astaroid-backend)
  - [Installation](#installation)
  - [Environmental variables](#environmental-variables)
  - [Database](#database)
    - [Tables](#tables)
      - [users](#users)
      - [assets](#assets)
      - [market](#market)
      - [notifications](#notifications)
    - [Functions](#functions)
    - [Triggers](#triggers)
  - [Storage](#storage)
  - [Api docs](#api-docs)
    - [Available constants](#available-constants)
      - [ASC-PRICE](#asc-price)
      - [DESC-PRICE](#desc-price)
      - [ASC-RAREST](#asc-rarest)
      - [DESC-RAREST](#desc-rarest)
      - [SOLD_ASSET_MESSAGE](#sold_asset_message)
      - [BOUGHT_CRYSTAL_MESSAGE](#bought_crystal_message)
    - [Available types](#available-types)
      - [Crystal](#crystal)
      - [Asset](#asset)
      - [User](#user)
      - [UserAuth](#userauth)
      - [UserProfileImage](#userprofileimage)
      - [CrystalBought](#crystalbought)
      - [AssetSold](#assetsold)
      - [MergeAsset](#mergeasset)
      - [NotificationMetadata](#notificationmetadata)
      - [Notification](#notification)
    - [Available methods](#available-methods)
      - [POST - market](#post---market)
      - [GET - market](#get---market)
      - [POST - signup](#post---signup)
      - [POST - signin](#post---signin)
      - [POST - confirm-email](#post---confirm-email)
      - [POST - magic-link](#post---magic-link)
      - [GET - user](#get---user)
      - [POST - user](#post---user)
      - [DELETE - user](#delete---user)
      - [POST - profile-image](#post---profile-image)
      - [GET - asset](#get---asset)
      - [POST - buy](#post---buy)
      - [POST - merge](#post---merge)
      - [POST - sell](#post---sell)
      - [POST - merge](#post---merge)
      - [GET - notification](#get---notification)
      - [POST - notification](#post---notification)
      - [DELETE - notification](#delete---notification)
  - [Api error messages](#api-error-messages)
  - [License](#license)

## Installation

To install astaroid-backend, first clone the [repo](https://github.com/astaroid/backend.git)

```sh
git clone https://github.com/astaroid/backend.git
```

or [download](https://github.com/astaroid/backend/releases/tag/1.0.0-stable) the compressed file.

Secondly install all required dependencies with `npm install`  (or `pnpm install` or `yarn install`).

## Environmental variables

Astaroid-backend required some important environmental variables to function properly.

> Set all the `Environmental variable` in **.env** file at the astaroid-backend root directory.

| Environmental variable  | Meaning  | Function |
| ------------ | ------------ | ------------ |
|  VITE_SUPABASE_URL | supabase project url | the url to your supabase project to handle astaroid-backend backend services |
|  VITE_SUPABASE_KEY | supabase project api secret key  | the `service_role` api key of your supabase project to handle astaroid-backend backend services  |
|  VITE_API_KEY | astaroid-backend api secret key  | the api secret key need to access all astaroid-backend apis |
|  VITE_ADMIN_KEY | astaroid-backend admin secret key  | the api secret key need to access admin functionality api (e.g create a crystal)  |

## Database

### Tables

Astaroid-backend require the following postgres database tables.

| Table  | Function  |
| ------------ | ------------ |
| users  | to store the user data  |
| assets  | to store users assets  |
|  market | to store crystals |
|  notifications | to store users notifications  |

#### users

The users table require the following columns.

| Column | Data type | Format |
| ------------ | ------------ | ------------ |
| id | uuid  | uuid |
| username | text  | text |
| password | text  | text  |
| email | text  | text |
| profile_image | text | text |
| created_at | timestamp without time zone | timestamp |
| coin | numeric  | numeric |
| email_confirm | text  | text |

#### assets

The assets table require the following columns.

| Column | Data type | Format |
| ------------ | ------------ | ------------ |
| id | uuid | uuid |
| user_id | uuid | uuid |
| color | character varying | varchar |
| volume | numeric | numeric |
| assets_metadata | ARRAY | json |

#### market

The market table require the following columns.

| Column | Data type | Format |
| ------------ | ------------ | ------------ |
| id | uuid | uuid |
| color | character varying | varchar |
| price | numeric | numeric |
| crystal_market_cap | numeric | numeric |
| rarest | numeric | numeric |
| sellers_metadata | ARRAY | json |
| total_market_cap | numeric | numeric |

#### notifications

The notifications table require the following columns.

| Column | Data type | Format |
| ------------ | ------------ | ------------ |
| id | uuid | uuid |
| user_id | uuid | uuid |
| notification_metadata | json | json |
| read | character varying | varchar |

### Functions

Astaroid-backend require the following postgres functions.

| Name | Arguments | Return type |
| ------------ | ------------ | ------------ |
| buy_crystal | _id uuid,_color character varying, _seller_id uuid,_buyer_id uuid, _transaction_fee numeric,_old_price numeric, _new_price numeric,_crystal_market_cap numeric, _total_market_cap numeric,_rarest numeric, _sellers_metadata json[],_buyer_crystal_volume numeric, _buyer_assets_metadata json[],_is_buyer_asset_created character varying, _buyer_notification_metadata json | json  |
| check_user_data | _user_id uuid,_user_metadata json | json |
| check_user_id | _id uuid,_fallback_id uuid  | uuid |
| create_crystal | action text, _id uuid,_color character varying, _price numeric,_crystal_market_cap numeric, _total_market_cap numeric,_rarest numeric, _sellers_metadata json[] | json |
| delete_notification | _user_id uuid,_notification_id uuid | json |
| get_authorize_data | _user_id uuid,_data_request_metadata json | json |
| check_signup_data | _email character varying,_username character varying | json |
| handle_delete_user |  | trigger |
| handle_new_user |   | trigger |
| handle_update_user |   | trigger |
| insert_merged_asset | _user_id uuid,_color character varying, _merged_asset_metadata json,_parent_color_query text | json |
| sell_asset | _id uuid,_color character varying, _seller_id uuid,_price numeric, _crystal_market_cap numeric,_total_market_cap numeric, _rarest numeric,_crystal_market_metadata json[], _seller_asset_volume numeric,_seller_assets_metadata json[], _is_seller_asset_created character varying,_seller_notification_metadata json | json |
| update_notification | _user_id uuid,_notification_id uuid, _read character varying | json |

### Triggers

Astaroid-backend require the following postgres triggers.

| Name | Table | Function | Event |
| ------------ | ------------ | ------------ | ------------ |
| on_auth_user_created | users | handle_new_user | INSERT |
| on_auth_user_deleted | users | handle_delete_user | INSERT |
| on_auth_user_updated | users | handle_update_user | INSERT |

## Storage

Astaroid-backend requires a public [supabase storage](#https://supabase.com/docs/guides/storage) bucket, `profile-image` to store the user profile picture.

## Api docs

### Making request

All queries to the Astaroid-backend need to be presented in this form: `[PROTOCOL]`:/\/`[HOST]`\/api\/`[METHOD_NAME]`?api_key=`API_KEY`.

> <http://localhost:3000/api/market?api_key=[API_KEY]>

Astaroid-backend support GET, POST and DELETE HTTP methods. We support two ways of passing parameters in requests:

- [URL query string](https://en.wikipedia.org/wiki/Query_string)
- application/json

The response contains a JSON object, which always has a Boolean field `ok` and the Object fields `data` and `error`. If `ok` equals True, the request was successful and the result of the request can be found in the `data` field. In case of an unsuccessful request, `ok` equals false and the error is found in `error` field, which is a JSON object containing the error message and code.

- All methods in the Astaroid-backend API are case-insensitive.
- All queries must be made using UTF-8.

### Available constants

#### ASC-PRICE

Arrange crystal by price in ascending order.

#### DESC-PRICE

Arrange crystal by price in descending order.

#### ASC-RAREST

Arrange crystal by rarest rate in ascending order.

#### DESC-RAREST

Arrange crystal by rarest rate in descending order.

#### SOLD_ASSET_MESSAGE

Notification message sent when a user sell an asset.

#### BOUGHT_CRYSTAL_MESSAGE

Notification message sent when a user buy a crystal.

### Available types

#### Crystal

Representation of a crystal in the market.

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| id | String | unique identification of the crystal in the market |
| color | String | color of the crystal |
| price | Number | price of the crystal |
| rarest | Number | rate of rarest of the crystal in the market |
| crystal_market_cap | Number | total number of the crystal in the market |

#### Asset

Representation of a user asset(crystal bought by the user).

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| id | String | unique identification of the asset |
| color | String | color of the asset |
| volume | Number | number of the asset the user has |
| user_id | String | unique identification of the user who owns the asset |

#### User

Representation of a user.

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| id | String | unique identification of the user |
| username | String | user username |
| email | String | user email address |
| password | String | user password |
| profile_image | String | link to the user profile image |
| created_at | String | timestamp of the date and time the user was created |
| coin | Number | number of coin the the user has |
| email_confirm | String | if **true** then the user email address is verified, else if **false** then user email address is not verified |

#### UserAuth

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| id | String | unique identification of the user |
| verify | String | if **true** then the user email address is verified, else if **false** then user email address is not verified |

#### UserProfileImage

Representation of a user profile image.

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| image_url | String | link to the image on the web |

#### CrystalBought

Representation of a crystal bought by a user.

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| id | String | unique identification of the asset |
| color | String | color of the asset |
| volume | Number | number of this asset the user has |
| user_id | String | unique identification of the user who bought the crystal |
| market_crystal| [Crystal](#crystal) | the crystal bought by the user |

#### AssetSold

Representation of an asset sold by a user.

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| id | String | unique identification of the crystal in the market |
| color | String | color of the crystal |
| price | Number | price of the crystal |
| rarest | Number | rate of rarest of the crystal in the market |
| crystal_market_cap | Number | total number of the crystal in the market |
| user_asset | [Asset](#asset) | the asset sold by the user |

#### MergeAsset

Representation of a merged asset.

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| id | String | unique identification of the asset |
| color | String | color of the asset |
| volume | Number | number of this asset the user has |
| user_id | String | unique identification of user who merged the assets |
| parents | Array of [Asset](#asset) | list of assets merged together to create the merged asset | 

#### NotificationMetadata

Representation of a user notification message metadata.

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| type | [SOLD_ASSET_MESSAGE](#sold_asset_message) or [BOUGHT_CRYSTAL_MESSAGE](#bought_crystal_message) | type of notification message |
| message | String | notification message |
| created_at | String | Javascript [Temporal.ZonedDateTime](https://tc39.es/proposal-temporal/docs/zoneddatetime.html) ISO string format of the current date when the notification was created |

#### Notification

Representation of a user notification message.

| Field | Type | Description |
| ------------ | ------------ | ------------ |
| id | String | unique identification of the notification |
| user_id | String | unique identification of the user |
| read | String | if **true** then the notification message has been read, else if **false** then the notification message has not been read  |
| notification_metadata | [NotificationMetadata](#notificationmetadata) | notification metadata |

### Available methods

> All methods in the Astaroid-backend API are case-insensitive and support GET, POST and DELETE HTTP methods. Use either [URL query string](https://en.wikipedia.org/wiki/Query_string) or application/json for passing parameters in Astaroid-backend API requests.
On successful call, a JSON object containing a Boolean field `ok` and a Object field `data`, while the `error` Object field is **null**.

#### POST - market

> The request must have `POST` as it HTTP method.

Use to create a crystal. **no data** is return even if the request is successful.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/market?admin_key=`[ADMIN_KEY]`

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| admin_key | String | **YES** | astaroid-backend admin secret key |

**Example**

```sh
http://localhost:3000/api/market?admin_key=[ADMIN_KEY]
```

#### GET - market

> The request must have `GET` as it HTTP method.

Use to get all crystals. On success an Array of [Crystal](#crystal) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/market?api_key=`[API_KEY]`&color=`[COLOR]`&price=`[PRICE]`&rarest=`[RAREST]`&order=`[ORDER]`

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| color | Array of String | **Optional** | list of color of crystals to get |
| price | Array of Number | **Optional** | list of price of crystals to get |
| rarest | Array of Number | **Optional** | list of rarest rate of crystals to get |
| order | [ASC-PRICE](#asc-price) or [DESC-PRICE](#desc-price) or [ASC-RAREST](#asc-rarest) or [DESC-RAREST](#desc-rarest) | **Optional** | order of arrangement of the crystals |

**Example**

```sh
http://localhost:3000/api/market?api_key=[API_KEY]&color=green,red,yellow&price=10,20,40&rarest=40&order=ASC-PRICE
```

#### POST - signup

> The request must have `POST` as it HTTP method.

Use to sign up a user. On success [UserAuth](#userauth) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/auth\/signup?api_key=`[API_KEY]`

Remainding parameters(expect `api_key`) are passed in the body of the request with the header content-type of `application/json`.

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| username | String | **YES** | user username |
| email | String | **YES** | user email address |
| password | String | **YES** | user password |

**Example**

```sh
http://localhost:3000/api/auth/signup?api_key=[API_KEY]
```

Request body

```json
{
 "username": "user1234",
 "email": "uer1234@gmail.com",
 "password": "secret_1223"
}
```

#### POST - signin

> The request must have `POST` as it HTTP method.

Use to sign in a user. On success [UserAuth](#userauth) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/auth\/signin?api_key=`[API_KEY]`

Remaining parameters(expect `api_key`) are passed in the body of the request with the header content-type of `application/json`.

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| usernameOrEmail | String | **YES** | user username or email address |
| password | String | **YES** | user password |

**Example**

```sh
http://localhost:3000/api/auth/signin?api_key=[API_KEY]
```

Request body

```json
{
 "usernameOrEmail": "uer1234@gmail.com",
 "password": "secret_1223"
}
```

#### POST - confirm-email

> The request must have `POST` as it HTTP method.

Use to send a user a confirmation email. **no data** is return even if the request is successful.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/auth\/confirm-email?api_key=`[API_KEY]`&user_id=`[USER_ID]`

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| user_id | String | **YES** | unique identification of the user to send the confirmation email |

**Example**

```sh
http://localhost:3000/api/auth/confirm-email?api_key=[API_KEY]&user_id=[USER_ID]
```

#### POST - magic-link

> The request must have `POST` as it HTTP method.

Use to send a magic link to a user email. **no data** is return even if the request is successful.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/auth\/magic-link?api_key=`[API_KEY]`&email=`[EMAIL]`

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| email | String | **YES** | user email address to the magic link |

**Example**

```sh
http://localhost:3000/api/auth/magic-link?api_key=[API_KEY]&email=user123@gmail.com
```

#### GET - user

> The request must have `GET` as it HTTP method.

Use to get data about a user. On success [User](#user) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`?api_key=`[API_KEY]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]?api_key=[API_KEY]
```
#### POST - user

> The request must have `POST` as it HTTP method.

Use to edit the user data. On success [User](#user) is returned. On failure with error code **201**, **202**, **203** [User](#user) is stilled returned and the error.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`?api_key=`[API_KEY]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

Remaining parameters(expect `api_key`) are passed in the body of the request with the header content-type of `application/json`.

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| username | String | **OPTIONAL** | user new username |
| email | String | **OPTIONAL** | user new email address |
| password | String | **OPTIONAL** | user new password |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]?api_key=[API_KEY]
```

Request body

```json
{
 "password": "BORdaBKGgo12345",
 "email": "user1second@gmail.com"
}
```

#### DELETE - user

> The request must have `DELETE` as it HTTP method.

Use to delete a data. **no data** is return even if the request is successful.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`?api_key=`[API_KEY]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]?api_key=[API_KEY]
```

#### POST - profile-image

> The request must have `POST` as it HTTP method.

Use to upload a user profile image. On success [UserProfileImage](#userprofileimage) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`\/profile-image?api_key=`[API_KEY]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

Remaining parameters(expect `api_key`) are passed in the body of the request with the header content-type of `application/json`.

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| data | String | **YES** | base64 encoded string of image to upload |
| type | String | **YES** | content-type of image to upload  |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]/profile-image?api_key=[API_KEY]
```

Request body

```json
{
 "data": "iVBORw0KGgoAAAANSUhEUgAAAvo......",
 "type": "image/png"
}
```

#### GET - asset

> The request must have `GET` as it HTTP method.

Use to get the user assets. On success an Array of [Asset](#asset) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`\/asset?api_key=`[API_KEY]`&color=`[COLOR]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| color | Array of String | **Optional** | list of color of assets to get |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]/asset?api_key=[API_KEY]&color=red,blue
```

#### POST - buy

> The request must have `POST` as it HTTP method.

Use to buy a crystal. On success [CrystalBought](#crystalbought) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`\/asset\/buy?api_key=`[API_KEY]`&crystal_id=`[CRYSTAL_ID]`&bought_at=`[BOUGHT_AT]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| crystal_id | String | **YES** | unique identification of the crystal to buy |
| bought_at | String | **OPTIONAL** | Javascript [Temporal.ZonedDateTime](https://tc39.es/proposal-temporal/docs/zoneddatetime.html) ISO string format of the current date when the crystal was bought  |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]/asset/buy?api_key=[API_KEY]&crystal_id=[CRYSTAL_ID]&bought_at=2022-08-10T12:48:08.14908722+01:00[Africa/Lagos]
```

#### POST - merge

> The request must have `POST` as it HTTP method.

Use to merge a user assets together.  On success [MergeAsset](#mergeasset) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`\/asset\/merge?api_key=`[API_KEY]`&assets=`[ASSETS]`&created_at=`[CREATED_AT]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| assets | Array of String | **YES** | list of color of assets to merge |
| created_at | String | **OPTIONAL** | Javascript [Temporal.ZonedDateTime](https://tc39.es/proposal-temporal/docs/zoneddatetime.html) ISO string format of the current date when the merged asset was merged |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]/asset/merge?api_key=[API_KEY]&assets=red,blue&created_at=2022-08-10T12:48:08.14908722+01:00[Africa/Lagos]
```

#### POST - sell

> The request must have `POST` as it HTTP method.

Use to sell a user asset. On success [AssetSold](#assetsold) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`\/asset\/sell?api_key=`[API_KEY]`&asset_id=`[ASSET_ID]`&sold_at =`[SOLD_AT]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| asset_id | String | **YES** | unique identification of the asset to sell |
| sold_at | String | **OPTIONAL** | Javascript [Temporal.ZonedDateTime](https://tc39.es/proposal-temporal/docs/zoneddatetime.html) ISO string format of the current date when the crystal was sold |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]/asset/sell?api_key=[API_KEY]&asset_id=[ASSET_ID]&sold_at=2022-08-10T12:48:08.14908722+01:00[Africa/Lagos]
```

#### GET - notification

> The request must have `GET` as it HTTP method.

Use to get all the user notifications. On success Array of [Notification](#notification) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`\/notification?api_key=`[API_KEY]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]/notification?api_key=[API_KEY]
```

#### POST - notification

> The request must have `POST` as it HTTP method.

Use to set a user notification to read or not. On success [Notification](#notification) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`\/notification?api_key=`[API_KEY]`&notification_id=`[NOTIFICATION_ID]`&read=`[READ]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| notification_id | String | **YES** | unique identification of the notification to edit |
| read | String | **OPTIONAL** | if **true** then the notification message is set to read, else if **false** then the notification message is set to not read |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]/notification?api_key=[API_KEY]&notification_id=[NOTIFICATION_ID]&read=true
```

#### DELETE - notification

> The request must have `DELETE` as it HTTP method.

Use to delete a user notification. On success [Notification](#notification) is returned.

**Syntax**

>`[PROTOCOL]`:/\/`[HOST]`\/api\/user\/`[USER_ID]`\/notification?api_key=`[API_KEY]`&notification_id=`[NOTIFICATION_ID]`

```[USER_ID] placeholder represent the unique identification of the user the method is carried out on.```

| Parameter | Type | Required | Description |
| ------------ | ------------ | ------------ | ------------ |
| api_key | String | **YES** | astaroid-backend api secret key |
| notification_id | String | **YES** | unique identification of the notification to delete |

**Example**

```sh
http://localhost:3000/api/user/[USER_ID]/notification?api_key=[API_KEY]&notification_id=[NOTIFICATION_ID]
```  

## Api error messages

Astaroid-backend return the following error messages when there is a bad request from the client.

| Message | Code |
| ------------ | ------------ |
| Incorrect admin key | 100 |
| Incorrect api key | 102 |
| Backend error | 104 |
| User not found | 106 |
| Email already exist | 201 |
| Username already exist | 202 |
| Username and email already exist | 203 |
| Username or email not found | 204 |
| Incorrect password | 205 |
| Insufficient coins | 206 |
| Asset id required | 207 |
| Asset not found | 208 |
| Assets required | 209 |
| 2 or more assets required | 210 |
| Crystal id required | 211 |
| Crystal not found | 212 |
| Notification id required | 213 |
| Notification not found | 214 |

## License

[GPL-3.0](https://github.com/astaroid/website/blob/main/LICENSE)
