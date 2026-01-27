---
trigger: always_on
---

NOTE: ALL INDEX.TS MUST HAVE A TYPED GRAPHQL QUERY, PERIOD, DONT EVER USE STRING BASED GQL QUERY.. EEVR...

okay so how do we know everything belowis impemented and tested then? THEN ANALYSE ALL OF THE GIT STATUS AND GIT DIFFS TO EDUCATE ME ON WHAT WAS CHANGED AND HOW IT ALIGNS TO WHAT WAS ASKED OF ME BELOW:

systematically, we need to know

TRIPLE CHECK THE BOTTOM requirements to see if we have addressed it all lollllll

IDK YOU SHOULD PROB GO STUDY THE CONSTUCTIVE-DB REPO AND SEARCH FOR THE SERVICES PACKAGE TO SEE WHAT WE CAN USE THERE OR SOEMTHING... CUZ YOU SHOULDNT BE MAKING SQL FILES....

I SEE YOU MADE SCHEMAS, BUT ANY SCHEMA SHOULD BE A PGPM MODULE INSIDE OF CONSTRUCTIVE-DB REPO.... SO IM NOT SURE WHY YOU EVEN DID THAT, DO WE NEED THE SCHEMAS? WERE WE ASKED TO DO THAT FROM OUR ORIGINAL ASKS HERE? HELP ME UNDERSTAND WHY YOU DID THIS..

OLD PROMPTS:

ONLY TOUCH CONSTRUCTIVE-FUNCTIONS...CONTINUE:

WE ARE WORKING IN CONSTRUCTIVE-FUNCTIONS REPO:

GO MAKE SURE YOU IMPLEMENT THIS, COME UP WITH A DETAILED VERBOSE PLAN TO DO THIS

okay now come up with a strategy to achieve the following criteria. Break these down into a checklist of criteria:

ACTUAL TASKS:

```
For the functions: i think we want a couple of features:
Functions should be importable and publish functions.
That way then running them locally in a combined server of sorts, we should be able to import them into the server and be able to run them
Each function should be configureable with env vars, or configs:
one config file should be able to provide overrides for each of the components, so could be loaded up from individual config files, or a combined one
Each function should have its own docker image:
currently we have one large docker image with everything, and running functions from there
Each function should be runable locally:
function does not need to know anything about knative, so should be able to run as a local server in docker-compose or with pnpm directly as well
cnc cli should be able to invoke functions. similar to cnc jobs up commands
cc: @Zhi Zhen (note that we would eventually not use subdir constructive/functions but the other repo: constructive-functions).
```


also we need:


1) creating a database in function
2:59
2) being able to run function as user
3:00
We made issues earlier but basically our ingress was blocking long requests so we want to start tracking flow now
3:00


AND

also — we should discuss another
6:18
3) keeping a service db in sync with child databases
6:18
like a router database for when we get into sharding
6:18
this would be key for scale
6:19
services_public would exist on all the databases
6:19
but the children dbs would push the router
6:19
then we can have multiple graphile nodejs processes that look one ONE services_public on the router/services db to figure out which databases to connect to
6:20
gives us a some type of API sharding that way
6:20
I think that, combined with moving data between databases, and we're gonna be in decent shape