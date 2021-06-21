import { listLazyRoutes } from '@angular/compiler/src/aot/lazy_routes';
import { Component, OnInit } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { styles } from './mapstyles';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'google-maps';

  private map: google.maps.Map
  service: google.maps.places.PlacesService;
  infowindow: google.maps.InfoWindow;
  lista = [] as any;
  place = [] as any;

  ngOnInit(): void {
    let loader = new Loader({
      apiKey: 'AIzaSyB5aQxkMgu-c6wmPQ_s8RO_Ks_YEYjC3YA&libraries=places'
    })

    loader.load().then(() => {
      let location = { lat: 51.48206196924044, lng: -0.11387620609008471 };
      this.infowindow = new google.maps.InfoWindow();
      this.map = new google.maps.Map(document.getElementById("map"), {
        center: location,
        zoom: 16,
        styles: styles
      })
    let service = new google.maps.places.PlacesService(this.map);    
    let getNextPage: () => void | false;
    let moreButton = document.getElementById("more") as HTMLButtonElement;
    moreButton.onclick = function () {
      moreButton.disabled = true;  
      if (getNextPage) {
        getNextPage();
      }
    };

    service.nearbySearch(
      { location: location, radius: 500, type: "store" },
      (
        results: google.maps.places.PlaceResult[] | null,
        status: google.maps.places.PlacesServiceStatus,
        pagination: google.maps.places.PlaceSearchPagination | null
      ) => {
        if (status !== "OK" || !results) return;  
        this.addPlaces(results, this.map);
        console.log('these are the results', results);
        for (let i = 0; i < results.length; i++) {
          this.addPlace(results[i]);
        }
        moreButton.disabled = !pagination || !pagination.hasNextPage;        
        if (pagination && pagination.hasNextPage) {
          getNextPage = () => {
            // Note: nextPage will call the same handler function as the initial call
            pagination.nextPage();
          };
        }        
      }      
    );

    })
   
  }

  addPlace(value) {
    // console.log('this is the value', this.lista.length);
    this.lista.push(value);    
    const request = {
      placeId: value.reference,
      fields: ["name", "formatted_address", "place_id", "geometry", "website", "business_status", "rating", "user_ratings_total", "international_phone_number", "plus_code"],
    };
    let map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        center: value.geometry.location,
        zoom: 15,
      }
    );
    const infowindow = new google.maps.InfoWindow();
    const service = new google.maps.places.PlacesService(map);  
    service.getDetails(request, (place, status) => {
      if ( status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
        const marker = new google.maps.Marker({ 
        map, 
        position: place.geometry.location})
      //console.log('this is the place', place);
      this.place.push(place);
    }}
    );
    
  }
  
  addPlaces(
    places: google.maps.places.PlaceResult[],
    map: google.maps.Map
  ) {
    const placesList = document.getElementById("places") as HTMLElement;  
    for (const place of places) {
      if (place.geometry && place.geometry.location) {
        const image = {
          url: place.icon!,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };  
        new google.maps.Marker({
          map,
          icon: image,
          title: place.name!,
          position: place.geometry.location,
        });  
        const li = document.createElement("li");
        li.textContent = place.name!;
        // placesList.appendChild(li);
  
        li.addEventListener("click", () => {
          map.setCenter(place.geometry!.location!);
        });
      }
    }
  }
}
