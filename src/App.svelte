<script>
  import { authState } from 'rxfire/auth';
  import { collectionData } from 'rxfire/firestore';
  import Fa from 'svelte-fa'
  import { faFacebook } from '@fortawesome/free-brands-svg-icons'
  import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

  import Map from './Map.svelte';
  import { db, auth, facebookProvider } from './firebase';

  let user;
  let locations;

  authState(auth).subscribe(u => (user = u));

  const signIn = () => {
    auth.signInWithPopup(facebookProvider);
  }

  const signOut = async () => {
    await auth.signOut();
  }

  const locationsRef = db.collection('locations');

  locations = collectionData(
    locationsRef
  );
</script>

<style lang="scss">
  @import 'mediaqueries';

  main {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    padding-top: 93px;

    @include top-level-content();
  }

  header {
    position: fixed;
    top: 0;
    z-index: 99;
    height: 92px;
    box-shadow: 0 4px 10px rgb(82, 36, 36);
    background-color: rgb(255, 255, 255);
    width: 100%;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;

    div.brand, div.nav >div {
      @include top-level-content();
      padding: 0 1em;
    }

    div.brand {
      h1 {
        margin: 0;
        font-size: 2em;
        margin-right: auto;
      }

      >div {
        height: 44px;
        padding: 0.25em 0;
        display: flex;
        flex-direction: row;
        align-items: center;

        a.fb {
          color: rgb(66, 103, 178);
          font-size: 2.5em;
          text-shadow: 1px 1px 1px #ccc;
        }
      }
    }

    div.nav {
      height: 40px;
      width: 100%;
      background-color: rgb(255, 196, 0);

      >div {
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
      }

      nav {
        span, a {
          opacity: 0.4;
        }

        a {
          cursor: pointer;
          transition-duration: 0.1s;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
</style>

<header>
  <div class="brand">
    <div>
      <h1>Bhakti Map</h1>
      <a href="https://facebook.com/bhaktiheart" class="fb"><Fa icon={faFacebook} fw/></a>
    </div>
  </div>
  <div class="nav">
    <div>
      <nav>
        {#if user}
          <span>Hi, {user.displayName}!</span>
          <a on:click={signOut}><Fa icon={faSignOutAlt} fw/></a>
        {:else}
          <a on:click={signIn}>Sign in <Fa icon={faSignInAlt} fw/></a>
        {/if}
      </nav>
    </div>
  </div>
</header>
<main>
  <Map {locations}/>
</main>
