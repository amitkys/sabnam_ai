"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Apptest() {
  return (
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader className="sticky top-0 bg-background z-10">
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          </DrawerHeader>

          <div className="h-[50vh] px-4">
            <ScrollArea className="h-full w-full">
              <div className="pr-4">
                {" "}
                {/* Add right padding for scroll bar */}
                <DrawerDescription>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Similique, quos. Id pariatur perspiciatis asperiores esse,
                  commodi blanditiis quis quisquam maxime neque nesciunt amet
                  eligendi explicabo, sit a nisi incidunt nam! Quod, in modi
                  iure, cupiditate nesciunt, ipsam cumque quos minus quia maxime
                  tempore possimus dicta perspiciatis animi accusantium numquam
                  aut beatae? Fugiat eaque temporibus nulla nesciunt dignissimos
                  sapiente rerum aspernatur. Incidunt, ab culpa iure facere
                  tempora modi harum velit cum deserunt odit saepe illo et
                  voluptatibus tenetur officia? Rem iure voluptatum quo quaerat
                  minus tenetur, nesciunt a aspernatur delectus consequatur!
                  Pariatur enim odit voluptates doloribus quas minima modi
                  perferendis consequatur dolorum repellat officia deleniti
                  error ipsum numquam, exercitationem maxime vitae, harum natus
                  iste placeat. Assumenda sequi qui dolore facilis modi.
                  Necessitatibus deserunt ea aperiam velit. Ea inventore odio
                  culpa repellendus aperiam. Molestiae ducimus, obcaecati
                  nesciunt dignissimos eum possimus, deleniti dicta soluta
                  pariatur natus a quia assumenda repellat, ipsum at minus?
                  Ratione, tenetur quidem illum consequuntur, voluptates odit
                  maiores tempore mollitia exercitationem quis debitis in, error
                  assumenda rerum praesentium natus adipisci! Deserunt eos
                  mollitia doloremque dignissimos nesciunt explicabo alias
                  beatae aspernatur. Rerum dolores doloremque deserunt cumque,
                  expedita adipisci voluptate praesentium ut excepturi vel. Sed
                  ipsam vitae odio, ducimus, assumenda quidem molestias voluptas
                  ipsum non dolores et amet tempore soluta eum vel. Nostrum iure
                  voluptas doloribus facere officiis unde consequuntur maxime
                  reprehenderit minus consectetur esse, eum corporis dolor optio
                  nulla possimus, commodi temporibus repellat. Nesciunt atque
                  consequuntur cumque ex pariatur non labore? Nostrum, molestiae
                  similique dolore officiis dolor laborum, dolores beatae a qui
                  ullam unde, dolorem ipsa doloribus? Necessitatibus incidunt,
                  ullam alias sunt iure aperiam culpa voluptatibus praesentium
                  veniam, illo, porro aliquam! Error dolores animi, rem aut
                  eaque adipisci veritatis quo mollitia doloribus est non
                  fugiat, dicta tempore odit? Sunt labore minus accusantium,
                  nobis quod, earum perspiciatis provident corrupti nemo alias
                  officia.
                </DrawerDescription>
              </div>
            </ScrollArea>
          </div>

          <DrawerFooter className="sticky bottom-0 bg-background z-10">
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
