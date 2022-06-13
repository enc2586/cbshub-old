import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

// import { FixedSizeList } from "react-window";

export default function FixedList({
  items,
  height,
  width,
  itemSize,
  handleListItemClick,
  emptyMessage,
}) {
  const renderRow = () => {
    if (items.length != 0) {
      return items.map((item, index) => (
        <ListItem disablePadding key={index}>
          <ListItemButton
            onClick={(event) => handleListItemClick(event.target.innerText)}
          >
            <ListItemText primary={item} />
          </ListItemButton>
        </ListItem>
      ));
    } else {
      return (
        <ListItem disablePadding key={emptyMessage}>
          <ListItemText primary={emptyMessage} />
        </ListItem>
      );
    }
  };

  return (
    <Box>
      <List
        sx={{
          width: { width },
          //   maxWidth: 360,
          //   bgcolor: "background.paper",
          //   position: "relative",
          overflow: "auto",
          height: { height },
          //   maxHeight: 300,
        }}
        // itemSize={itemSize}
        itemCount={1}
        overscanCount={1}
      >
        {renderRow}
      </List>
    </Box>
  );
}
